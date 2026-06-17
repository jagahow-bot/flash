"use client";

import { useMemo } from "react";
import type { Control, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  getPhoneCountryCodeOptionLabel,
  PHONE_COUNTRY_CODES,
} from "@/lib/phone/country-codes";
import {
  useAppDictionary,
  useAppLocale,
} from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PhoneNumberFieldProps<T extends FieldValues> = {
  control: Control<T>;
  register: UseFormRegister<T>;
  countryCodeName: Path<T>;
  phoneName: Path<T>;
  label: string;
  phoneId: string;
  placeholder?: string;
  error?: string;
};

export function PhoneNumberField<T extends FieldValues>({
  control,
  register,
  countryCodeName,
  phoneName,
  label,
  phoneId,
  placeholder = "912 345 678",
  error,
}: PhoneNumberFieldProps<T>) {
  const c = useAppDictionary().common;
  const locale = useAppLocale();
  const countryOptions = useMemo(
    () =>
      PHONE_COUNTRY_CODES.map((option) => ({
        code: option.code,
        label: getPhoneCountryCodeOptionLabel(option, locale),
      })),
    [locale]
  );

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={phoneId}>{label}</Label>
      <div className="flex gap-2">
        <Controller
          name={countryCodeName}
          control={control}
          defaultValue={DEFAULT_PHONE_COUNTRY_CODE as never}
          render={({ field }) => (
            <select
              aria-label={c.countryCodeAria}
              className={cn(
                "h-8 w-[9.5rem] shrink-0 rounded-lg border border-input bg-transparent px-2 text-sm outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "dark:bg-input/30"
              )}
              value={
                typeof field.value === "string" && field.value
                  ? field.value
                  : DEFAULT_PHONE_COUNTRY_CODE
              }
              onChange={(event) => field.onChange(event.target.value)}
            >
              {countryOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label} {option.code}
                </option>
              ))}
            </select>
          )}
        />
        <Input
          id={phoneId}
          type="tel"
          className="min-w-0 flex-1"
          placeholder={placeholder}
          autoComplete="tel-national"
          {...register(phoneName)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
