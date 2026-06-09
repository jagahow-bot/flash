"use client";

import {
  formatInternationalPhone,
  formatPhoneDisplay,
  parseInternationalPhone,
  phonesMatch,
} from "@/lib/phone/format";
import { formatAvailabilitySlot } from "@/lib/availability/slots";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { SocialContactLinks } from "@/components/project/social-contact-links";
import { buildContactLinkItems } from "@/lib/social/contact-links";
import {
  formatIntakeBudgetFromForm,
  formatIntakeColorMode,
  formatIntakeGender,
  formatIntakeSizeFromForm,
  formatIntakeStyle,
} from "@/lib/intake/display";
import type { IntakeForm } from "@/types/intake-form";

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function formatWhatsappDisplay(
  phoneCountryCode: string | undefined,
  phone: string | undefined,
  whatsapp: string | undefined,
  samePhoneSuffix: string
): string | undefined {
  if (!whatsapp) return undefined;

  const phoneInternational = formatInternationalPhone(
    phoneCountryCode ?? "",
    phone ?? ""
  );

  if (phoneInternational && phonesMatch(phoneInternational, whatsapp)) {
    const display = formatPhoneDisplay(phoneCountryCode, phone);
    return display ? `${display}${samePhoneSuffix}` : undefined;
  }

  const parsed = parseInternationalPhone(whatsapp);
  return (
    formatPhoneDisplay(parsed?.countryCode, parsed?.national) ?? whatsapp
  );
}

export function ClientIntakeSummary({ intakeForm }: { intakeForm: IntakeForm }) {
  const dict = useAppDictionary();
  const b = dict.booking;
  const slotLabels = {
    days: b.availabilityDays,
    periods: b.availabilityPeriods,
    separator: b.availabilitySlotSeparator,
  };
  const contacts = intakeForm.socialContacts;
  const contactLinks = buildContactLinkItems(contacts);

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={b.placement} value={intakeForm.placement} />
        <Field label={b.size} value={formatIntakeSizeFromForm(intakeForm)} />
        <Field
          label={b.style}
          value={formatIntakeStyle(intakeForm.style, dict)}
        />
        <Field
          label={b.colorMode}
          value={formatIntakeColorMode(intakeForm.colorMode, dict)}
        />
        <Field label={b.budget} value={formatIntakeBudgetFromForm(intakeForm)} />
      </div>

      <Field label={b.description} value={intakeForm.description} />

      {intakeForm.isCoverUp && (
        <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
          {b.coverUp}
        </p>
      )}

      {intakeForm.availability.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground">{b.availability}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {intakeForm.availability.map((slot) => (
              <span
                key={slot}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
              >
                {formatAvailabilitySlot(slot, slotLabels)}
              </span>
            ))}
          </div>
        </div>
      )}

      <Field label={b.notes} value={intakeForm.notes} />

      {contacts && (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              {b.contactSection}
            </p>
            {contactLinks.length > 0 ? (
              <SocialContactLinks items={contactLinks} />
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={b.name} value={contacts.clientName} />
            <Field
              label={b.gender}
              value={formatIntakeGender(contacts.gender, dict)}
            />
            <Field
              label={b.phone}
              value={formatPhoneDisplay(contacts.phoneCountryCode, contacts.phone)}
            />
            <Field
              label={b.whatsapp}
              value={formatWhatsappDisplay(
                contacts.phoneCountryCode,
                contacts.phone,
                contacts.whatsapp,
                b.whatsappSamePhoneSuffix
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
