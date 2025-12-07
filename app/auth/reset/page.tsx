"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

export default function ResetPasswordPage() {
  const locale: Locale = useLocale();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // セッションがあるかチェック（リセットリンクから来ているか）
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError(
          locale === "en"
            ? "This password reset link is invalid or has expired. Please request a new email and try again."
            : "パスワード再設定用のリンクが無効か、期限切れです。もう一度メールからやり直してください。",
        );
      } else {
        setReady(true);
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!password || !confirm) {
      setError(
        locale === "en"
          ? "Please enter your new password twice."
          : "新しいパスワードを2回入力してください。",
      );
      return;
    }

    if (password !== confirm) {
      setError(
        locale === "en"
          ? "Passwords do not match."
          : "パスワードが一致していません。",
      );
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabaseBrowser.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStatus(
      locale === "en"
        ? "Your password has been updated. Please log in again."
        : "パスワードを更新しました。ログイン画面からログインしてください。",
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              DocuFlow
            </h1>
            <p className="text-xs text-slate-500">
              {locale === "en" ? "Reset password" : "パスワード再設定"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              {locale === "en"
                ? "Set a new password"
                : "新しいパスワードを設定"}
            </h2>
            <p className="text-xs text-slate-500">
              {locale === "en"
                ? "This page is only valid when opened from the link in your email."
                : "メールに記載されたリンクからアクセスしている場合のみ有効です。"}
            </p>
          </div>

          {status && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {status}
            </p>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                {locale === "en" ? "New password" : "新しいパスワード"}
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={!ready || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:bg-white focus:ring disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                {locale === "en"
                  ? "New password (confirmation)"
                  : "新しいパスワード（確認）"}
              </label>
              <input
                id="confirm"
                type="password"
                required
                disabled={!ready || loading}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:bg-white focus:ring disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <button
              type="submit"
              disabled={!ready || loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? locale === "en"
                  ? "Updating..."
                  : "更新中..."
                : locale === "en"
                ? "Update password"
                : "パスワードを更新"}
            </button>
          </form>

          <Link
            href={locale === "en" ? "/auth/login?lang=en" : "/auth/login"}
            className="mt-2 block text-center text-[11px] font-medium text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
          >
            {locale === "en"
              ? "Back to login"
              : "ログイン画面に戻る"}
          </Link>
        </section>
      </main>
    </div>
  );
}
