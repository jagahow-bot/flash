"use client";

import type {
  Control,
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { AvailabilityPicker } from "@/components/intake/availability-picker";
import { PhoneNumberField } from "@/components/intake/phone-number-field";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { CLIENT_GENDER_OPTIONS } from "@/lib/validations/intake-form";
import type { Studio } from "@/types/studio";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface BookingSharedFields {
  availability: string[];
  notes: string;
  clientName: string;
  gender: string;
  phoneCountryCode?: string;
  phone?: string;
  whatsappSameAsPhone: boolean;
  whatsappCountryCode?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  line?: string;
  threads?: string;
  ageConfirmed?: boolean;
}

interface BookingSharedSectionProps<T extends FieldValues & BookingSharedFields> {
  studio: Studio;
  control: Control<T>;
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  errors: FieldErrors<T>;
  showAgeConsent?: boolean;
}

export function BookingSharedSection<T extends FieldValues & BookingSharedFields>({
  studio,
  control,
  register,
  watch,
  errors,
  showAgeConsent = true,
}: BookingSharedSectionProps<T>) {
  const dict = useAppDictionary();
  const b = dict.booking;
  const whatsappSameAsPhone = watch("whatsappSameAsPhone" as Path<T>);

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">
          <div className="flex flex-col gap-2">
            <Label>{b.availability} *</Label>
            <Controller
              name={"availability" as Path<T>}
              control={control}
              render={({ field }) => (
                <AvailabilityPicker
                  operatingHours={studio.operatingHours}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.availability?.message as string | undefined}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">{b.notes}</Label>
            <Textarea
              id="notes"
              placeholder={b.notesPlaceholder}
              rows={2}
              {...register("notes" as Path<T>)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{b.contactSection}</CardTitle>
          <CardDescription>{b.contactSectionDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="clientName">{b.name} *</Label>
              <Input
                id="clientName"
                placeholder={b.namePlaceholder}
                autoComplete="name"
                {...register("clientName" as Path<T>)}
              />
              {errors.clientName && (
                <p className="text-sm text-destructive">
                  {errors.clientName.message as string}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gender">{b.gender} *</Label>
              <select
                id="gender"
                className={cn(
                  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  "dark:bg-input/30"
                )}
                {...register("gender" as Path<T>)}
              >
                <option value="" disabled>
                  {b.selectGender}
                </option>
                {CLIENT_GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {b.genderOptions[option] ?? option}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p className="text-sm text-destructive">
                  {errors.gender.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <PhoneNumberField
              control={control}
              register={register}
              countryCodeName={"phoneCountryCode" as Path<T>}
              phoneName={"phone" as Path<T>}
              label={b.phone}
              phoneId="phone"
              placeholder="912 345 678"
            />
            <label className="flex items-center gap-2 text-sm">
              <Controller
                name={"whatsappSameAsPhone" as Path<T>}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              {b.whatsappSameAsPhone}
            </label>
            {!whatsappSameAsPhone && (
              <PhoneNumberField
                control={control}
                register={register}
                countryCodeName={"whatsappCountryCode" as Path<T>}
                phoneName={"whatsapp" as Path<T>}
                label={b.whatsapp}
                phoneId="whatsapp"
                placeholder="912 345 678"
              />
            )}
          </div>

          <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" placeholder="" {...register("instagram" as Path<T>)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                placeholder={b.facebookPlaceholder}
                {...register("facebook" as Path<T>)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="line">LINE ID</Label>
              <Input id="line" placeholder="" {...register("line" as Path<T>)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="threads">Threads</Label>
              <Input id="threads" placeholder="" {...register("threads" as Path<T>)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {showAgeConsent && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <Controller
                name={"ageConfirmed" as Path<T>}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <Label className="font-normal leading-relaxed">
                {b.ageConfirmLegal} *
              </Label>
            </div>
            {errors.ageConfirmed && (
              <p className="mt-2 text-sm text-destructive">
                {errors.ageConfirmed.message as string}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
