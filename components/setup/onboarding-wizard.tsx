"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { WeeklyScheduleEditor } from "@/components/settings/weekly-schedule-editor";
import { formatMessage } from "@/lib/i18n/format";
import {
  DEFAULT_WEEKLY_SCHEDULE,
  isWeeklyScheduleValid,
  normalizeWeeklySchedule,
} from "@/lib/availability/weekly-schedule";
import {
  formatBookingDateKey,
  formatBookingNumber,
  getStudioBookingCode,
} from "@/lib/project/booking-number";
import { slugifyStudioName, isValidStudioSlug } from "@/lib/studio/slug";
import type { StudioWeeklySchedule } from "@/types/operating-hours";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function OnboardingWizard({ email }: { email: string }) {
  const dict = useAppDictionary();
  const s = dict.setup;
  const set = dict.settings;
  const c = dict.common;
  const steps = [
    { id: 1, label: s.stepStudio },
    { id: 2, label: s.stepHours },
    { id: 3, label: s.stepPayment },
    { id: 4, label: s.stepDone },
  ] as const;
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [bio, setBio] = useState("");
  const [acceptsCoverUp, setAcceptsCoverUp] = useState(true);
  const [weeklySchedule, setWeeklySchedule] = useState<StudioWeeklySchedule>(
    normalizeWeeklySchedule(DEFAULT_WEEKLY_SCHEDULE)
  );
  const [paymentInfo, setPaymentInfo] = useState(s.paymentTemplate);
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const previewBookingCode = useMemo(
    () =>
      bookingCode.trim()
        ? bookingCode.trim().toUpperCase()
        : getStudioBookingCode({ slug, bookingCode }),
    [bookingCode, slug]
  );

  useEffect(() => {
    if (!slugTouched && name) {
      setSlug(slugifyStudioName(name));
    }
  }, [name, slugTouched]);

  useEffect(() => {
    if (!slug || !isValidStudioSlug(slug)) {
      setSlugStatus(slug ? "invalid" : "idle");
      return;
    }

    setSlugStatus("checking");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/onboarding/slug?slug=${encodeURIComponent(slug)}`
        );
        const data = await response.json();
        setSlugStatus(data.available ? "available" : "taken");
      } catch {
        setSlugStatus("idle");
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [slug]);

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!name.trim()) return s.nameRequired;
      if (!isValidStudioSlug(slug)) {
        return s.slugInvalid;
      }
      if (slugStatus === "taken") return s.slugTaken;
      if (slugStatus === "checking") return s.slugChecking;
    }

    if (current === 2 && !isWeeklyScheduleValid(weeklySchedule)) {
      return s.hoursInvalid;
    }

    if (current === 3 && !paymentInfo.trim()) {
      return s.paymentRequired;
    }

    return null;
  }

  function goNext() {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }

    setError(null);
    setStep((current) => Math.min(current + 1, 4));
  }

  function goBack() {
    setError(null);
    setStep((current) => Math.max(current - 1, 1));
  }

  function validateAllSteps(): string | null {
    for (let current = 1; current <= 3; current += 1) {
      const message = validateStep(current);
      if (message) return message;
    }
    return null;
  }

  async function handleCreate() {
    const message = validateAllSteps();
    if (message) {
      setError(message);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          bookingCode: bookingCode.trim() || undefined,
          bio,
          paymentInfo,
          acceptsCoverUp,
          weeklySchedule,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? s.createFailed);
        return;
      }

      const nextSlug = typeof data.slug === "string" ? data.slug : slug;
      setCreatedSlug(nextSlug);
      setStep(4);
    } catch {
      setError(s.createFailedRetry);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{s.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatMessage(s.welcome, { email })}
        </p>
      </div>

      <ol className="flex items-center justify-between gap-2">
        {steps.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 text-center text-xs",
              step >= item.id ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full border text-xs font-medium",
                step > item.id && "border-primary bg-primary text-primary-foreground",
                step === item.id && "border-primary text-primary",
                step < item.id && "border-muted-foreground/30"
              )}
            >
              {item.id}
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step - 1].label}</CardTitle>
          <CardDescription>
            {step === 1 && s.step1Description}
            {step === 2 && s.step2Description}
            {step === 3 && s.step3Description}
            {step === 4 && s.step4Description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step === 1 && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="studio-name">{set.studioNameLabel}</Label>
                <Input
                  id="studio-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={s.studioNamePlaceholder}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="studio-slug">{set.bookingUrlLabel}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/</span>
                  <Input
                    id="studio-slug"
                    value={slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSlug(
                        event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                      );
                    }}
                    placeholder="mohen-tattoo"
                    required
                  />
                  <span className="text-sm text-muted-foreground">/book</span>
                </div>
                {slugStatus === "available" && (
                  <p className="text-xs text-emerald-600">{s.slugAvailable}</p>
                )}
                {slugStatus === "taken" && (
                  <p className="text-xs text-destructive">{s.slugUnavailable}</p>
                )}
                {slugStatus === "invalid" && slug && (
                  <p className="text-xs text-destructive">{s.slugFormatHint}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-code">{set.bookingCodeLabel}</Label>
                <Input
                  id="booking-code"
                  value={bookingCode}
                  onChange={(event) =>
                    setBookingCode(
                      event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                    )
                  }
                  placeholder={getStudioBookingCode({ slug })}
                  maxLength={12}
                />
                <p className="text-xs text-muted-foreground">
                  {s.examplePrefix}
                  {formatBookingNumber(
                    previewBookingCode,
                    formatBookingDateKey(),
                    1
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="studio-bio">{set.studioBioLabel}</Label>
                <Textarea
                  id="studio-bio"
                  rows={3}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder={s.bioPlaceholder}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={acceptsCoverUp}
                  onCheckedChange={(checked) => setAcceptsCoverUp(checked === true)}
                />
                {set.acceptsCoverUp}
              </label>
            </>
          )}

          {step === 2 && (
            <WeeklyScheduleEditor
              value={weeklySchedule}
              onChange={setWeeklySchedule}
            />
          )}

          {step === 3 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="payment-info">{set.paymentInfoTitle}</Label>
              <Textarea
                id="payment-info"
                rows={6}
                value={paymentInfo}
                onChange={(event) => setPaymentInfo(event.target.value)}
              />
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4 text-sm">
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                {s.createdMessage}
              </p>
              {(createdSlug ?? slug) ? (
                <p className="text-muted-foreground">
                  {formatMessage(s.bookingUrlPreview, {
                    slug: createdSlug ?? slug,
                  })}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    router.replace("/dashboard");
                    router.refresh();
                  }}
                >
                  {s.goToDashboard}
                </Button>
                {(createdSlug ?? slug) ? (
                  <Link href={`/${createdSlug ?? slug}/book`} target="_blank">
                    <Button variant="outline" type="button">
                      {s.openBookingPage}
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {step < 4 && (
            <div className="flex justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 1 || isSubmitting}
              >
                {s.previousStep}
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={goNext}>
                  {s.nextStep}
                </Button>
              ) : (
                <Button type="button" onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? s.creating : s.createStudio}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
