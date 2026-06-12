"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDictionary } from "@/components/providers/locale-provider";
import type { PlatformStudioSummary } from "@/lib/firestore/platform-studios.server";
import type { PlatformBillingTier, StudioBillingStatus } from "@/types/billing";

type EditFormState = {
  promoFreeUntil: string;
  billingExemptUntil: string;
  freeBookingsRemaining: string;
  platformBillingTier: PlatformBillingTier;
  billingStatus: StudioBillingStatus;
  platformNotes: string;
};

function emptyForm(): EditFormState {
  return {
    promoFreeUntil: "",
    billingExemptUntil: "",
    freeBookingsRemaining: "0",
    platformBillingTier: "paid",
    billingStatus: "active",
    platformNotes: "",
  };
}

function formatApiError(
  body: { error?: unknown; details?: unknown },
  fallback: string
): string {
  if (typeof body.error !== "string" || !body.error.trim()) {
    return fallback;
  }

  if (typeof body.details === "string" && body.details.trim()) {
    return `${body.error}: ${body.details}`;
  }

  return body.error;
}

function formFromStudio(studio: PlatformStudioSummary): EditFormState {
  return {
    promoFreeUntil: studio.promoFreeUntil ?? "",
    billingExemptUntil: studio.billingExemptUntil ?? "",
    freeBookingsRemaining: String(studio.freeBookingsRemaining),
    platformBillingTier: studio.platformBillingTier ?? "paid",
    billingStatus: studio.billingStatus ?? "active",
    platformNotes: studio.platformNotes ?? "",
  };
}

export function PlatformStudiosDashboard({
  initialStudios,
}: {
  initialStudios: PlatformStudioSummary[];
}) {
  const dict = useAppDictionary();
  const pa = dict.platformAdmin;
  const [studios, setStudios] = useState(initialStudios);
  const [selected, setSelected] = useState<PlatformStudioSummary | null>(null);
  const [form, setForm] = useState<EditFormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshStudios = useCallback(async () => {
    const response = await fetch("/api/platform/studios");
    if (!response.ok) {
      throw new Error(pa.loadFailed);
    }
    const data = (await response.json()) as { studios: PlatformStudioSummary[] };
    setStudios(data.studios);
    return data.studios;
  }, [pa.loadFailed]);

  function openEdit(studio: PlatformStudioSummary) {
    setSelected(studio);
    setForm(formFromStudio(studio));
    setMessage(null);
    setError(null);
  }

  function closeEdit() {
    setSelected(null);
    setMessage(null);
    setError(null);
  }

  async function handleSave() {
    if (!selected) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    const freeBookingsRemaining = Number(form.freeBookingsRemaining);
    if (!Number.isFinite(freeBookingsRemaining) || freeBookingsRemaining < 0) {
      setError(`${pa.fields.freeBookingsRemaining}: invalid value`);
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/platform/studios/${selected.studioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoFreeUntil: form.promoFreeUntil.trim() || null,
          billingExemptUntil: form.billingExemptUntil.trim() || null,
          freeBookingsRemaining,
          platformBillingTier: form.platformBillingTier,
          billingStatus: form.billingStatus,
          platformNotes: form.platformNotes.trim() || null,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        studio?: PlatformStudioSummary;
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        throw new Error(formatApiError(data, pa.saveFailed));
      }

      if (!data.studio) {
        throw new Error(pa.saveFailed);
      }

      setSelected(data.studio);
      setForm(formFromStudio(data.studio));
      setMessage(pa.saveSuccess);
      await refreshStudios();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : pa.saveFailed
      );
    } finally {
      setSaving(false);
    }
  }

  function tierLabel(tier: PlatformBillingTier | undefined) {
    const key = tier ?? "paid";
    return pa.tiers[key];
  }

  function paymentStatusLabel(status: StudioBillingStatus | undefined) {
    const key = status ?? "active";
    return pa.paymentStatuses[key];
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{pa.title}</h1>
        <p className="mt-2 text-muted-foreground">{pa.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{pa.studioListTitle}</CardTitle>
          <CardDescription>
            {studios.length} studio{studios.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {studios.length === 0 ? (
            <p className="text-sm text-muted-foreground">{pa.noStudios}</p>
          ) : (
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-2 py-2 font-medium">{pa.columns.name}</th>
                  <th className="px-2 py-2 font-medium">{pa.columns.slug}</th>
                  <th className="px-2 py-2 font-medium">{pa.columns.owner}</th>
                  <th className="px-2 py-2 font-medium">{pa.columns.freeQuota}</th>
                  <th className="px-2 py-2 font-medium">{pa.columns.completed}</th>
                  <th className="px-2 py-2 font-medium">
                    {pa.columns.monthlySuccess}
                  </th>
                  <th className="px-2 py-2 font-medium">
                    {pa.columns.monthlyBillable}
                  </th>
                  <th className="px-2 py-2 font-medium">{pa.columns.billingTier}</th>
                  <th className="px-2 py-2 font-medium">
                    {pa.columns.paymentStatus}
                  </th>
                  <th className="px-2 py-2 font-medium">{pa.columns.promo}</th>
                  <th className="px-2 py-2 font-medium">{pa.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {studios.map((studio) => (
                  <tr key={studio.studioId} className="border-b last:border-0">
                    <td className="px-2 py-3 font-medium">{studio.name}</td>
                    <td className="px-2 py-3 font-mono text-xs">{studio.slug}</td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {studio.ownerEmail ?? dict.common.emptyDash}
                    </td>
                    <td className="px-2 py-3">{studio.freeBookingsRemaining}</td>
                    <td className="px-2 py-3">{studio.completedBookingsCount}</td>
                    <td className="px-2 py-3">
                      {studio.monthlySuccessfulCount}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({studio.currentMonth})
                      </span>
                    </td>
                    <td className="px-2 py-3">{studio.monthlyBillableCount}</td>
                    <td className="px-2 py-3">
                      {tierLabel(studio.platformBillingTier)}
                    </td>
                    <td className="px-2 py-3">
                      {paymentStatusLabel(studio.billingStatus)}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={
                          studio.promoActive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }
                      >
                        {studio.promoActive ? pa.promoActive : pa.promoInactive}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(studio)}
                      >
                        {pa.editStudio}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.slug} · {selected.ownerEmail ?? dict.common.emptyDash}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="promoFreeUntil">{pa.fields.promoFreeUntil}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoFreeUntil"
                      type="date"
                      value={form.promoFreeUntil}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          promoFreeUntil: event.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setForm((current) => ({ ...current, promoFreeUntil: "" }))
                      }
                    >
                      {pa.clearDate}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pa.fields.effectivePromoFreeUntil}:{" "}
                    {selected.effectivePromoFreeUntil ?? dict.common.emptyDash}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingExemptUntil">
                    {pa.fields.billingExemptUntil}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="billingExemptUntil"
                      type="date"
                      value={form.billingExemptUntil}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          billingExemptUntil: event.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          billingExemptUntil: "",
                        }))
                      }
                    >
                      {pa.clearDate}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freeBookingsRemaining">
                    {pa.fields.freeBookingsRemaining}
                  </Label>
                  <Input
                    id="freeBookingsRemaining"
                    type="number"
                    min={0}
                    value={form.freeBookingsRemaining}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        freeBookingsRemaining: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platformBillingTier">
                    {pa.fields.platformBillingTier}
                  </Label>
                  <select
                    id="platformBillingTier"
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    value={form.platformBillingTier}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        platformBillingTier: event.target
                          .value as PlatformBillingTier,
                      }))
                    }
                  >
                    <option value="free">{pa.tiers.free}</option>
                    <option value="trial">{pa.tiers.trial}</option>
                    <option value="paid">{pa.tiers.paid}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingStatus">{pa.fields.paymentStatus}</Label>
                  <select
                    id="billingStatus"
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    value={form.billingStatus}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        billingStatus: event.target.value as StudioBillingStatus,
                      }))
                    }
                  >
                    <option value="active">{pa.paymentStatuses.active}</option>
                    <option value="past_due">{pa.paymentStatuses.past_due}</option>
                    <option value="suspended">
                      {pa.paymentStatuses.suspended}
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platformNotes">{pa.fields.platformNotes}</Label>
                  <Textarea
                    id="platformNotes"
                    rows={3}
                    value={form.platformNotes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        platformNotes: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">{pa.monthlyBreakdown}</p>
                  {selected.billingMonths.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {dict.common.emptyDash}
                    </p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="py-1 text-left">{pa.monthColumn}</th>
                          <th className="py-1 text-right">{pa.successColumn}</th>
                          <th className="py-1 text-right">{pa.billableColumn}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.billingMonths.map((month) => (
                          <tr key={month.yearMonth}>
                            <td className="py-1">{month.yearMonth}</td>
                            <td className="py-1 text-right">{month.count}</td>
                            <td className="py-1 text-right">
                              {month.billableCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {message ? (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    {message}
                  </p>
                ) : null}
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeEdit}>
                  {pa.backToStudios}
                </Button>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? pa.saving : pa.saveChanges}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
