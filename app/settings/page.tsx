import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { AccountInfoCard } from "@/components/AccountInfoCard";
import { DeleteAccountSection } from "../app/DeleteAccountSection";
import { deleteAccount } from "../app/accountActions";
import { getLocaleFromParam, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type SettingsPageProps = {
  searchParams: Promise<{
    lang?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const sp = await searchParams;
  const locale: Locale = getLocaleFromParam(sp?.lang);
  const withLang = (href: string) => {
    if (locale !== "en") return href;
    if (href.includes("lang=en")) return href;
    if (href.includes("?")) return `${href}&lang=en`;
    return `${href}?lang=en`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">
              {locale === "en" ? "Settings" : "設定"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse h-32" />}>
          <AccountInfoCard />
        </Suspense>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            {locale === "en" ? "Settings menu" : "設定メニュー"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={withLang("/settings/organizations")}
              className="group rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="font-semibold text-slate-900">
                {locale === "en" ? "Organizations" : "組織・チーム"}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                {locale === "en"
                  ? "Create orgs, invite members, and manage roles (owner/admin/member)."
                  : "組織の作成・メンバー招待・ロール（owner / admin / member）の管理。"}
              </p>
            </Link>
            <Link
              href={withLang("/settings/billing")}
              className="group rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="font-semibold text-slate-900">
                {locale === "en" ? "Billing" : "課金・プラン"}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                {locale === "en"
                  ? "Plans, billing settings, and Stripe-ready flows."
                  : "Free / Pro / Team プランや、将来の Stripe 連携を前提とした課金設定。"}
              </p>
            </Link>
            <Link
              href={withLang("/settings/security")}
              className="group rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="font-semibold text-slate-900">
                {locale === "en" ? "Security" : "セキュリティ"}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                {locale === "en"
                  ? "Auth, 2FA/SSO roadmap, and security settings."
                  : "認証・2段階認証・SSO などのセキュリティ設定（設計済み / 一部 Coming Soon）。"}
              </p>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            {locale === "en" ? "Export data" : "データエクスポート"}
          </h2>
          <p className="text-xs text-slate-600">
            {locale === "en"
              ? "Download your documents, comments, activity logs, and notifications as a single JSON file (beta)."
              : "自分のドキュメント / コメント / アクティビティログ / 通知をまとめて JSON ファイルとしてダウンロードできます（ベータ機能）。"}
          </p>
          <div className="mt-3">
            <a
              href="/api/export"
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
            >
              {locale === "en" ? "Export (JSON)" : "データをエクスポート（JSON）"}
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            {locale === "en" ? "Log out" : "ログアウト"}
          </h2>
          <p className="text-xs text-slate-600">
            {locale === "en"
              ? "Ends your DocuFlow session. You'll need to log in again to continue."
              : "すべての端末から DocuFlow のセッションを終了します。再度利用するには、ログインページからサインインしてください。"}
          </p>
          <div className="mt-4">
            <Link
              href={withLang("/auth/logout")}
              className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                />
              </svg>
              <span>{locale === "en" ? "Log out" : "ログアウトする"}</span>
            </Link>
          </div>
        </section>

        <Suspense fallback={<div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 animate-pulse h-24" />}>
          <DeleteAccountSection deleteAccount={deleteAccount} />
        </Suspense>
      </main>
    </div>
  );
}
