"use client";

import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUploadZone } from "@/components/intake/image-upload-zone";
import { PreSessionDocumentsSettings } from "@/components/settings/pre-session-documents-settings";
import { StudioClosuresEditor } from "@/components/settings/studio-closures-editor";
import { WeeklyScheduleEditor } from "@/components/settings/weekly-schedule-editor";
import {
  isWeeklyScheduleValid,
  normalizeWeeklySchedule,
} from "@/lib/availability/weekly-schedule";
import {
  formatBookingDateKey,
  formatBookingNumber,
  getStudioBookingCode,
} from "@/lib/project/booking-number";
import { compressImage } from "@/lib/storage/compress-image";
import { uploadStudioLogo } from "@/lib/storage/upload-studio-logo";
import { normalizeStudioSocialLinks } from "@/lib/studio/social-links";
import { locales, localeLabels, defaultLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_DEPOSIT_DEADLINE_DAYS } from "@/lib/project/deposit-deadline";
import type { Studio } from "@/types/studio";
import type { StudioClosure } from "@/types/studio-closure";
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

export function StudioSettingsForm({ studio }: { studio: Studio }) {
  const dict = useAppDictionary();
  const s = dict.settings;
  const e = dict.errors;
  const c = dict.common;
  const router = useRouter();
  const [name, setName] = useState(studio.name);
  const [bookingCode, setBookingCode] = useState(studio.bookingCode ?? "");
  const [bio, setBio] = useState(studio.bio);
  const [preferredLocale, setPreferredLocale] = useState<Locale>(
    studio.preferredLocale ?? defaultLocale
  );
  const [paymentInfo, setPaymentInfo] = useState(studio.paymentInfo);
  const [depositDeadlineDays, setDepositDeadlineDays] = useState(
    String(studio.depositDeadlineDays ?? DEFAULT_DEPOSIT_DEADLINE_DAYS)
  );
  const [careGuide, setCareGuide] = useState(studio.careGuide);
  const [acceptsCoverUp, setAcceptsCoverUp] = useState(studio.acceptsCoverUp);
  const [weeklySchedule, setWeeklySchedule] = useState<StudioWeeklySchedule>(
    normalizeWeeklySchedule(studio.weeklySchedule)
  );
  const [closures, setClosures] = useState<StudioClosure[]>(studio.closures);
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [logoUrl, setLogoUrl] = useState(studio.logoUrl ?? "");
  const [instagram, setInstagram] = useState(studio.socialLinks?.instagram ?? "");
  const [facebook, setFacebook] = useState(studio.socialLinks?.facebook ?? "");
  const [line, setLine] = useState(studio.socialLinks?.line ?? "");
  const [threads, setThreads] = useState(studio.socialLinks?.threads ?? "");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isWeeklyScheduleValid(weeklySchedule)) {
      setError(s.invalidWeeklyHours);
      return;
    }

    const parsedDeadlineDays = Number(depositDeadlineDays);
    if (
      !Number.isInteger(parsedDeadlineDays) ||
      parsedDeadlineDays < 1 ||
      parsedDeadlineDays > 30
    ) {
      setError(s.invalidDepositDeadline);
      return;
    }

    setIsSubmitting(true);

    try {
      let nextLogoUrl: string | null | undefined = logoUrl || undefined;

      if (logoFiles.length > 0) {
        const compressed = await compressImage(logoFiles[0]);
        nextLogoUrl = await uploadStudioLogo(studio.studioId, compressed);
      } else if (!logoUrl) {
        nextLogoUrl = null;
      }

      const nextSocialLinks = normalizeStudioSocialLinks({
        instagram,
        facebook,
        line,
        threads,
      });

      const response = await fetch("/api/studio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bookingCode: bookingCode.trim() ? bookingCode.trim().toUpperCase() : null,
          bio,
          preferredLocale,
          paymentInfo,
          depositDeadlineDays: parsedDeadlineDays,
          careGuide,
          acceptsCoverUp,
          weeklySchedule,
          closures,
          logoUrl: nextLogoUrl,
          socialLinks: nextSocialLinks ?? null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? e.saveFailed);
        return;
      }

      setLogoFiles([]);
      if (typeof nextLogoUrl === "string") {
        setLogoUrl(nextLogoUrl);
      } else if (nextLogoUrl === null) {
        setLogoUrl("");
      }

      setSuccessMessage(s.settingsSaved);
      router.refresh();
    } catch {
      setError(e.saveFailedRetry);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{s.basicInfoTitle}</CardTitle>
          <CardDescription>{s.basicInfoDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ImageUploadZone
            mode="single"
            thumbnailSize="sm"
            files={logoFiles}
            onChange={setLogoFiles}
            label={s.logoLabel}
            hint={s.logoHint}
            existingUrls={logoUrl ? [logoUrl] : []}
            onExistingUrlsChange={(urls) => setLogoUrl(urls[0] ?? "")}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">{s.bookingUrlLabel}</Label>
            <Input id="slug" value={`/${studio.slug}/book`} disabled />
            <p className="text-xs text-muted-foreground">{s.bookingUrlLocked}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bookingCode">{s.bookingCodeLabel}</Label>
            <Input
              id="bookingCode"
              value={bookingCode}
              onChange={(event) =>
                setBookingCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
              }
              placeholder={getStudioBookingCode({ slug: studio.slug })}
              maxLength={12}
            />
            <p className="text-xs text-muted-foreground">
              {s.bookingCodeFormatPrefix}
              {formatBookingNumber(
                bookingCode.trim()
                  ? bookingCode.trim().toUpperCase()
                  : getStudioBookingCode({ slug: studio.slug, bookingCode }),
                formatBookingDateKey(),
                1
              )}
              {s.bookingCodeFormatSuffix}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{s.studioNameLabel}</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">{s.studioBioLabel}</Label>
            <Textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="preferredLocale">{s.briefLanguageLabel}</Label>
            <select
              id="preferredLocale"
              value={preferredLocale}
              onChange={(event) =>
                setPreferredLocale(event.target.value as Locale)
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {locales.map((locale) => (
                <option key={locale} value={locale}>
                  {localeLabels[locale]}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {s.briefLanguageDescription}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={acceptsCoverUp}
              onCheckedChange={(checked) => setAcceptsCoverUp(checked === true)}
            />
            {s.acceptsCoverUp}
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{s.weeklyHoursTitle}</CardTitle>
          <CardDescription>{s.weeklyHoursDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyScheduleEditor
            value={weeklySchedule}
            onChange={setWeeklySchedule}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{s.closuresTitle}</CardTitle>
          <CardDescription>{s.closuresDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <StudioClosuresEditor value={closures} onChange={setClosures} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{s.paymentInfoTitle}</CardTitle>
          <CardDescription>{s.paymentInfoDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            rows={5}
            value={paymentInfo}
            onChange={(event) => setPaymentInfo(event.target.value)}
            placeholder={s.paymentInfoPlaceholder}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="depositDeadlineDays">{s.depositDeadlineDaysLabel}</Label>
            <Input
              id="depositDeadlineDays"
              type="number"
              min={1}
              max={30}
              value={depositDeadlineDays}
              onChange={(event) => setDepositDeadlineDays(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {formatMessage(s.depositDeadlineHint, {
                days: DEFAULT_DEPOSIT_DEADLINE_DAYS,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{s.socialLinksTitle}</CardTitle>
          <CardDescription>{s.socialLinksDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
                placeholder=""
              />
              <p className="text-xs text-muted-foreground">{s.instagramNoAt}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={facebook}
                onChange={(event) => setFacebook(event.target.value)}
                placeholder={s.facebookPlaceholder}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="line">LINE</Label>
              <Input
                id="line"
                value={line}
                onChange={(event) => setLine(event.target.value)}
                placeholder={s.linePlaceholder}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="threads">
                Threads{dict.artists.bindEmailOptional}
              </Label>
              <Input
                id="threads"
                value={threads}
                onChange={(event) => setThreads(event.target.value)}
                placeholder={s.threadsPlaceholder}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <PreSessionDocumentsSettings studio={studio} />

      <Card>
        <CardHeader>
          <CardTitle>{s.aftercareTitle}</CardTitle>
          <CardDescription>{s.aftercareDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={5}
            value={careGuide}
            onChange={(event) => setCareGuide(event.target.value)}
          />
        </CardContent>
      </Card>

      {successMessage && (
        <p
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          {successMessage}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? c.saving : s.saveSettings}
      </Button>
    </form>
  );
}
