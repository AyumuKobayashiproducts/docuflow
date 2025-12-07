"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

const STORAGE_KEY = "docuflow_onboarding_seen_v1";

export function AppOnboardingTour() {
  const locale: Locale = useLocale();
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    return !seen;
  });

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-emerald-900">
            {locale === "en"
              ? "Getting started with DocuFlow – Try it in 3 steps"
              : "はじめての DocuFlow - 3ステップで試せます"}
          </p>
          <ol className="mt-2 space-y-1 text-[11px]">
            <li>
              1️⃣{" "}
              <span className="font-medium">
                {locale === "en"
                  ? "Open a sample document on the dashboard"
                  : "ダッシュボードでサンプルを開く"}
              </span>{" "}
              —{" "}
              {locale === "en"
                ? "Click a document from the list"
                : "一覧から気になるドキュメントをクリック"}
            </li>
            <li>
              2️⃣{" "}
              <span className="font-medium">
                {locale === "en"
                  ? "Try AI summary, tags, and search"
                  : "AI要約・タグ・検索を触る"}
              </span>{" "}
              —{" "}
              {locale === "en"
                ? 'Use the search bar with keywords like "auth" or "revenue"'
                : "上部の検索バーで「認証」「売上」などを検索"}
            </li>
            <li>
              3️⃣{" "}
              <span className="font-medium">
                {locale === "en"
                  ? "Create a new document"
                  : "新規ドキュメントを1つ作ってみる"}
              </span>{" "}
              —{" "}
              {locale === "en" ? (
                <>
                  Go to{" "}
                  <Link
                    href="/new?lang=en"
                    className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
                  >
                    /new
                  </Link>{" "}
                  and upload a file
                </>
              ) : (
                <>
                  <Link
                    href="/new"
                    className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
                  >
                    /new
                  </Link>{" "}
                  からファイルをアップロード
                </>
              )}
            </li>
          </ol>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700 hover:bg-emerald-100"
          aria-label={
            locale === "en" ? "Dismiss onboarding" : "オンボーディングを閉じる"
          }
        >
          ×
        </button>
      </div>
    </div>
  );
}







