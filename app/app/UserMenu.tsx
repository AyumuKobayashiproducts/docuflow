"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState<string>("U");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let active = true;
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!active) return;
      const userEmail = data.user?.email ?? "";
      if (userEmail) {
        setInitial(userEmail.charAt(0).toUpperCase());
        setEmail(userEmail);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white shadow-sm hover:opacity-90"
        aria-label="ユーザーメニュー"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-800 shadow-lg z-40">
          <div className="flex items-center gap-3 px-3 pb-3 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-900">
                アカウント
              </p>
              {email && (
                <p className="truncate text-[11px] text-slate-500">{email}</p>
              )}
            </div>
          </div>
          <Link
            href="/settings"
            className="block px-3 py-2 text-[13px] hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            アカウント設定を開く
          </Link>
          <button
            type="button"
            className="mt-1 flex w-full items-center justify-between px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 border-t border-slate-100"
            onClick={() => {
              setOpen(false);
              window.location.href = "/auth/logout";
            }}
          >
            <span>ログアウト</span>
          </button>
        </div>
      )}
    </div>
  );
}
