"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getLocaleFromParam } from "@/lib/i18n";

/**
 * グローバルな言語切り替えトグル。
 * - ログイン後のアプリ全体（/app, /settings, /documents, /new, /share など）に常に表示
 * - URL の ?lang=en を付け外しして、日本語 / 英語を切り替える
 */
export function GlobalLanguageToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 認証ページやランディング（/ と /en）は各ページのヘッダーに専用トグルがあるので除外
  if (
    !pathname ||
    pathname === "/" ||
    pathname.startsWith("/en") ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  // クエリパラメータからロケール判定
  const langParam = searchParams.get("lang") || undefined;
  const locale: Locale = getLocaleFromParam(langParam);

  const nextLocale: Locale = locale === "en" ? "ja" : "en";

  const params = new URLSearchParams(searchParams.toString());
  if (nextLocale === "en") {
    params.set("lang", "en");
  } else {
    params.delete("lang");
  }
  const query = params.toString();
  const href = query ? `${pathname}?${query}` : pathname;

  const label =
    nextLocale === "en"
      ? "Switch interface to English"
      : "日本語表示に切り替え";

  return (
    <div className="fixed bottom-4 right-4 z-[120]">
      <Link
        href={href}
        aria-label={label}
        className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-slate-50"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        <span>{nextLocale === "en" ? "EN" : "日本語"}</span>
      </Link>
    </div>
  );
}


