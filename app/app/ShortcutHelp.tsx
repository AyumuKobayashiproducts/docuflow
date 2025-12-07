"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

export function ShortcutHelp() {
  const [open, setOpen] = useState(false);
  const locale: Locale = useLocale();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
        aria-label={
          locale === "en"
            ? "Open keyboard shortcuts"
            : "キーボードショートカット一覧を開く"
        }
      >
        ?
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 text-[11px] text-slate-700 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-900">
                {locale === "en"
                  ? "Keyboard shortcuts"
                  : "キーボードショートカット"}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] text-slate-500 hover:bg-slate-100"
                aria-label={
                  locale === "en"
                    ? "Close shortcut list"
                    : "ショートカット一覧を閉じる"
                }
              >
                ×
              </button>
            </div>

            <p className="mb-2 text-[10px] text-slate-500">
              {locale === "en"
                ? "Shortcuts available on the DocuFlow dashboard."
                : "DocuFlow のダッシュボードで使えるショートカットです。"}
            </p>

            <ul className="space-y-1.5">
              <li className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1">
                <span className="text-[10px] text-slate-600">
                  {locale === "en"
                    ? "Focus the search box"
                    : "検索ボックスにフォーカス"}
                </span>
                <span className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-700">
                  /
                </span>
              </li>
              <li className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1">
                <span className="text-[10px] text-slate-600">
                  {locale === "en"
                    ? "Clear focus from search"
                    : "フォーカス中の検索を解除"}
                </span>
                <span className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-700">
                  Esc
                </span>
              </li>
              <li className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1">
                <span className="text-[10px] text-slate-600">
                  {locale === "en"
                    ? "Delete the card under the cursor"
                    : "カーソルを置いたカードを削除"}
                </span>
                <span className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-700">
                  Shift
                  <span>+</span>
                  <span>D</span>
                </span>
              </li>
            </ul>

            <p className="mt-3 text-[10px] text-slate-500">
              {locale === "en"
                ? 'Clicking the blank area of a card toggles the "bulk delete" checkbox. On the archive list, you can also use "bulk restore".'
                : 'カードの空白部分クリックで「一括削除」のチェックを ON/OFF できます。アーカイブ一覧では「一括復元」も利用できます。'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}



