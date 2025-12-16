import { cookies, headers } from "next/headers";
import { getLocaleFromParam, type Locale } from "@/lib/i18n";

const LOCALE_COOKIE = "docuflow_lang";

/**
 * Server-side locale inference used for pages that don't have `?lang=`.
 * Priority: cookie > Accept-Language (ja => ja, otherwise en)
 */
export async function getPreferredLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const c = cookieStore.get(LOCALE_COOKIE)?.value ?? null;
  if (c) return getLocaleFromParam(c);

  const h = await headers();
  const accept = (h.get("accept-language") ?? "").toLowerCase();
  const first = accept.split(",")[0]?.trim() ?? "";
  return first.startsWith("ja") ? "ja" : "en";
}


