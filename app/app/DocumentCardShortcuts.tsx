"use client";

import { useEffect } from "react";

/**
 * ダッシュボードのカードに対してキーボードショートカットを付与するレイヤー。
 *
 * - カード上にマウスカーソルを置いた状態で Shift + D で削除
 */
export function DocumentCardShortcuts() {
  useEffect(() => {
    let currentCard: HTMLElement | null = null;

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const card = target.closest<HTMLElement>("[data-doc-card]");
      if (card) {
        currentCard = card;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentCard) return;

      const key = event.key;

      // Shift + D のみ（ブラウザ標準の Cmd+D / Ctrl+D とは被らないようにする）
      const isShiftD =
        (key === "d" || key === "D") && event.shiftKey && !event.metaKey && !event.ctrlKey;

      if (isShiftD) {
        const deleteButton = currentCard.querySelector<
          HTMLButtonElement | HTMLDivElement
        >("[data-doc-delete-button]");

        if (deleteButton instanceof HTMLButtonElement) {
          event.preventDefault();
          deleteButton.click();
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}


