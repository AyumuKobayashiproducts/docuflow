"use client";

import { useEffect } from "react";

/**
 * ダッシュボードのカードに対してキーボードショートカットを付与するレイヤー。
 *
 * - カード上にマウスカーソルを置いた状態で以下のショートカットで削除:
 *   - Shift + D
 *   - Cmd + D / Cmd + Delete（Mac 想定）
 *   - Ctrl + D / Ctrl + Delete（Windows 想定）
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

      // 共通: Shift + D
      const isShiftD =
        (key === "d" || key === "D") && event.shiftKey && !event.metaKey && !event.ctrlKey;

      // Mac 想定: Cmd + D / Cmd + Delete
      const isMacStyle =
        event.metaKey &&
        ((key === "d" || key === "D" || key === "Backspace" || key === "Delete") &&
          !event.ctrlKey &&
          !event.shiftKey);

      // Windows 想定: Ctrl + D / Ctrl + Delete
      const isWindowsStyle =
        event.ctrlKey &&
        ((key === "d" || key === "D" || key === "Backspace" || key === "Delete") &&
          !event.metaKey &&
          !event.shiftKey);

      if (isShiftD || isMacStyle || isWindowsStyle) {
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


