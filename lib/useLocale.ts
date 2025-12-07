"use client";

import { useSearchParams } from "next/navigation";
import type { Locale } from "./i18n";
import { getLocaleFromParam } from "./i18n";

/**
 * Client-side hook to derive current locale from `?lang=` query.
 * Falls back to Japanese when no param is specified.
 */
export function useLocale(defaultLang?: string): Locale {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang") || defaultLang;
  return getLocaleFromParam(langParam ?? undefined);
}



