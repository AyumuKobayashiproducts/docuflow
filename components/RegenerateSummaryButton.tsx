"use client";

import { useFormStatus } from "react-dom";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

export function RegenerateSummaryButton() {
  const { pending } = useFormStatus();
  const locale: Locale = useLocale();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && (
        <span className="h-3 w-3 animate-spin rounded-full border border-emerald-300 border-t-transparent" />
      )}
      <span>
        {pending
          ? locale === "en"
            ? "Regenerating..."
            : "再生成中..."
          : locale === "en"
            ? "Regenerate summary"
            : "要約を再生成"}
      </span>
    </button>
  );
}
