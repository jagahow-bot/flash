import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { Locale } from "@/lib/i18n/config";
import { parsePreferredLocale } from "@/lib/i18n/parse-preferred-locale";

export { parsePreferredLocale } from "@/lib/i18n/parse-preferred-locale";

export async function getPreferredLocaleFromSession(
  session: string,
): Promise<Locale | null> {
  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    const doc = await getAdminDb().collection("users").doc(decoded.uid).get();
    return parsePreferredLocale(doc.data()?.preferredLocale) ?? null;
  } catch {
    return null;
  }
}
