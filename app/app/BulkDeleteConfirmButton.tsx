"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

type Props = {
  formId: string;
};

export function BulkDeleteConfirmButton({ formId }: Props) {
  const [open, setOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const locale: Locale = useLocale();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleToggleSelectAll = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const next = !selectAll;
    const checkboxes =
      form.querySelectorAll<HTMLInputElement>('input[name="ids"]');
    checkboxes.forEach((cb) => {
      cb.checked = next;

      const card = cb.closest<HTMLElement>("[data-doc-card]");
      if (!card) return;

      card.classList.toggle("ring-2", next);
      card.classList.toggle("ring-rose-300", next);
      card.classList.toggle("border-rose-300", next);
      card.classList.toggle("bg-rose-50/40", next);
    });
    setSelectAll(next);
  };

  const handleConfirm = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) {
      setOpen(false);
      return;
    }

    form.requestSubmit();
    setOpen(false);
  };

  return (
    <>
      <label className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-50">
        <input
          type="checkbox"
          className="h-3 w-3 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          checked={selectAll}
          onChange={handleToggleSelectAll}
        />
        <span>{locale === "en" ? "Select all" : "すべて選択"}</span>
      </label>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50"
      >
        🗑 {locale === "en" ? "Delete all" : "すべて削除"}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-lg">
            <p className="text-xs font-semibold text-slate-900">
              {locale === "en"
                ? "Delete all documents currently visible (including selected ones)?"
                : "表示中のドキュメント（選択中のものを含む）を削除しますか？"}
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              {locale === "en"
                ? 'This action cannot be undone. If you are sure, click "Yes, delete".'
                : "この操作は元に戻せません。よろしければ「はい、削除する」を押してください。"}
            </p>
            <div className="mt-4 flex justify-end gap-2 text-[11px]">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-600 hover:bg-slate-50"
              >
                {locale === "en" ? "Cancel" : "いいえ"}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-full bg-red-500 px-3 py-1 font-semibold text-white hover:bg-red-600"
              >
                {locale === "en" ? "Yes, delete" : "はい、削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
