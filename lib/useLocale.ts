"use client";

import type { Locale } from "./i18n";

/**
 * 常に日本語ロケールを返すフック
 * 英語版は別サイトで提供するため、このフックは日本語固定
 * 型は互換性のため Locale ("ja" | "en") を維持
 */
export function useLocale(_defaultLang?: string): Locale {
  return "ja";
}
