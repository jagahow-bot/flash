import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export async function PreviewReadonlyNotice() {
  const dict = await getAppDictionary(await getRequestLocale());

  return (
    <div className="rounded-lg border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
      {dict.preview.readonlyBanner}
    </div>
  );
}
