import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { Locale } from "@/lib/i18n";
import { getLocaleFromParam } from "@/lib/i18n";

type PageProps = {
  searchParams?: {
    lang?: string;
  };
};

export default function WhatsNewPage({ searchParams }: PageProps) {
  const locale: Locale = getLocaleFromParam(searchParams?.lang);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href={locale === "en" ? "/app?lang=en" : "/app"}
              className="hover:opacity-80 transition-opacity"
            >
              <Logo />
            </Link>
            <p className="text-sm text-slate-600">
              {locale === "en" ? "What's New" : "アップデート情報"}
            </p>
          </div>
          <Link
            href={locale === "en" ? "/app?lang=en" : "/app"}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            {locale === "en" ? "← Back to dashboard" : "← ダッシュボードへ戻る"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-base font-semibold text-slate-900">
            {locale === "en" ? "Latest updates" : "最新のアップデート"}
          </h1>
          <p className="text-xs text-slate-600">
            {locale === "en"
              ? "Highlights of recent features and improvements in DocuFlow, organized so reviewers can quickly see what matters."
              : "DocuFlow に最近追加された機能や改善点のハイライトです。面接官やレビュアーの方が「どこを見ればよいか」が分かるように整理しています。"}
          </p>
        </section>

        <section className="space-y-4">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-xs text-slate-800 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-emerald-900">
                {locale === "en"
                  ? "Google login & account info card"
                  : "Google ログイン対応 & アカウント情報カード"}
              </h2>
              <span className="text-[10px] text-emerald-700">2025-12-07</span>
            </div>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                {locale === "en" ? (
                  <>
                    Added a <strong>&quot;Sign in with Google&quot;</strong> button to
                    `/auth/login` and wired it to Google OAuth via Supabase
                    Auth.
                  </>
                ) : (
                  <>
                    `/auth/login` に<strong>「Google でログイン」</strong>
                    ボタンを追加し、Supabase Auth 経由で Google OAuth をサポート。
                  </>
                )}
              </li>
              <li>
                {locale === "en" ? (
                  <>
                    Handles the OAuth callback on `/auth/callback`, sets
                    DocuFlow&apos;s own session cookie, and redirects users to
                    `/app`.
                  </>
                ) : (
                  <>
                    `/auth/callback` で OAuth
                    コールバックを処理し、アプリ独自の Cookie を設定して `/app`
                    に遷移。
                  </>
                )}
              </li>
              <li>
                {locale === "en" ? (
                  <>
                    Added an <strong>&quot;Account information&quot; card</strong> on
                    `/settings` to show the user&apos;s email and login method
                    (Google / Email).
                  </>
                ) : (
                  <>
                    `/settings` に
                    <strong>「アカウント情報」カード</strong>
                    を追加し、メールアドレスとログイン方法（Google / Email）を表示。
                  </>
                )}
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-800 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {locale === "en"
                  ? "Organizations & RBAC / Notifications & Analytics"
                  : "組織・RBAC / 通知・アナリティクス"}
              </h2>
              <span className="text-[10px] text-slate-500">2025-12-06</span>
            </div>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                {locale === "en" ? (
                  <>
                    Added `organizations` / `organization_members` tables and
                    implemented role-based access control (Owner / Admin /
                    Member) via RLS. Teams can be switched from the organization
                    switcher.
                  </>
                ) : (
                  <>
                    `organizations` / `organization_members` を追加し、Owner /
                    Admin / Member
                    のロールベースアクセス制御（RLS）を実装。組織スイッチャーからチームを切り替え可能。
                  </>
                )}
              </li>
              <li>
                {locale === "en" ? (
                  <>
                    Introduced a `notifications` table and a notification bell
                    in the header to surface events like comments as in-app
                    notifications.
                  </>
                ) : (
                  <>
                    `notifications`
                    テーブルとヘッダーの通知ベルを追加し、コメントなどのイベントをアプリ内通知として表示。
                  </>
                )}
              </li>
              <li>
                {locale === "en" ? (
                  <>
                    `/app/analytics` now shows{" "}
                    <strong>lightweight team analytics</strong> such as number
                    of documents created and user activity in the last 30 days.
                  </>
                ) : (
                  <>
                    `/app/analytics` で
                    <strong>チーム利用の簡易アナリティクス</strong>
                    （直近30日のドキュメント作成数・ユーザーアクティビティ）を可視化。
                  </>
                )}
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-800 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {locale === "en"
                  ? "Quality gates & performance monitoring"
                  : "品質ゲート & パフォーマンス監視"}
              </h2>
              <span className="text-[10px] text-slate-500">2025-12-05</span>
            </div>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                {locale === "en" ? (
                  <>
                    Integrated Lighthouse CI into GitHub Actions and set a
                    target score of 80+ for
                    Performance/A11y/Best Practices/SEO.
                  </>
                ) : (
                  <>
                    Lighthouse CI を GitHub Actions に組み込み、
                    Performance/A11y/Best Practices/SEO 80+
                    を目標値として設定。
                  </>
                )}
              </li>
              <li>
                {locale === "en" ? (
                  <>
                    Added a Web Vitals dashboard via `lib/webVitals.ts` and
                    `/app/vitals` to visualize metrics like LCP, FID, and CLS.
                  </>
                ) : (
                  <>
                    `lib/webVitals.ts` と `/app/vitals`
                    による Web Vitals ダッシュボードを追加し、LCP/FID/CLS
                    などを可視化。
                  </>
                )}
              </li>
              <li>
                {locale === "en" ? (
                  <>
                    Introduced E2E tests (Playwright) and Supabase Migrations
                    CI as guardrails to avoid shipping breaking changes.
                  </>
                ) : (
                  <>
                    E2E テスト（Playwright）と Supabase Migrations CI
                    による、壊さないための仕組みを導入。
                  </>
                )}
              </li>
            </ul>
          </article>

          {/* Coming Soon */}
          <article className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-5 text-xs text-slate-800 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {locale === "en"
                  ? "Coming soon (planned additions)"
                  : "Coming Soon（今後追加したいもの）"}
              </h2>
              <span className="text-[10px] text-sky-700">Roadmap</span>
            </div>
            <p className="mb-2 text-[11px] text-slate-600">
              {locale === "en"
                ? "Ideas that are not yet implemented, but are strong candidates for the next iterations. They will be added step by step following the design docs and ADRs."
                : "実装までは至っていないものの、「次に取り組む候補」として検討しているアイデアです。設計ドキュメントや ADR に沿って、段階的に追加していく想定です。"}
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                {locale === "en" ? (
                  <>
                    Implement <strong>2FA (TOTP)</strong> following the Security
                    ADR, plus organization-level{" "}
                    <strong>SSO (Google Workspace / Entra ID)</strong>.
                  </>
                ) : (
                  <>
                    Security ADR に沿った
                    <strong> 2FA（TOTP）実装 </strong>
                    と、組織単位で有効化できる
                    <strong> SSO (Google Workspace / Entra ID) </strong>
                  </>
                )}
              </li>
              <li>
                {locale === "en" ? (
                  <>
                    <strong>Bidirectional links / related document views</strong>{" "}
                    between documents for a knowledge-graph-like browsing
                    experience.
                  </>
                ) : (
                  <>
                    ドキュメント間をつなぐ
                    <strong> 双方向リンク / 関連ドキュメント表示 </strong>
                    によるナレッジグラフ的な閲覧体験
                  </>
                )}
              </li>
              <li>
                {locale === "en" ? (
                  <>
                    <strong>
                      Notification integration to external tools such as Slack
                    </strong>{" "}
                    (comments / mentions / share links) and webhook-based
                    extensions.
                  </>
                ) : (
                  <>
                    Slack など外部ツールへの
                    <strong>
                      {" "}
                      通知連携（コメント/メンション/共有リンク発行）
                    </strong>
                    と Webhook ベースの拡張
                  </>
                )}
              </li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}




