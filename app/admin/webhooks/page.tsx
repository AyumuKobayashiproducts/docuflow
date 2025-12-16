import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPreferredLocale } from "@/lib/serverLocale";

type WebhookEventRow = {
  id: string;
  type: string;
  livemode: boolean;
  received_at: string;
  processed_at: string | null;
  status: "processing" | "processed" | "failed" | "ignored";
  error_message: string | null;
};

function getOwnerUserId(): string | null {
  const ownerUserId = process.env.DOCUFLOW_OWNER_USER_ID;
  return ownerUserId && ownerUserId.trim().length > 0 ? ownerUserId.trim() : null;
}

export default async function AdminStripeWebhooksPage() {
  const locale = await getPreferredLocale();
  const t = (ja: string, en: string) => (locale === "en" ? en : ja);
  const withLang = (href: string) => {
    if (locale !== "en") return href;
    if (href.includes("lang=en")) return href;
    if (href.includes("?")) return `${href}&lang=en`;
    return `${href}?lang=en`;
  };

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    const loginPath = locale === "en" ? "/en/auth/login" : "/auth/login";
    redirect(`${loginPath}?redirectTo=${encodeURIComponent("/admin/webhooks")}`);
  }

  const ownerUserId = getOwnerUserId();
  if (!ownerUserId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Logo />
              <p className="text-sm text-slate-600">
                {t("Webhook運用（管理者）", "Webhook ops (admin)")}
              </p>
            </div>
            <Link href={withLang("/app")} className="btn btn-secondary btn-sm">
              {t("← ダッシュボードに戻る", "← Back to dashboard")}
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">
              {t("管理ページが未設定です", "Admin page is not configured")}
            </p>
            <p className="mt-2">
              {
                t(
                  "Vercel の環境変数に DOCUFLOW_OWNER_USER_ID（あなたの user_id）を追加し、Redeploy してください。",
                  "Set DOCUFLOW_OWNER_USER_ID (your user_id) in Vercel env vars and redeploy.",
                )
              }
            </p>
            <p className="mt-2 text-xs text-amber-800">
              {t("あなたの user_id（ログイン中）: ", "Your user_id (logged in): ")}
              <span className="font-mono">{userId}</span>
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (userId !== ownerUserId) {
    return notFound();
  }

  if (!supabaseAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Logo />
              <p className="text-sm text-slate-600">
                {t("Webhook運用（管理者）", "Webhook ops (admin)")}
              </p>
            </div>
            <Link href={withLang("/app")} className="btn btn-secondary btn-sm">
              {t("← ダッシュボードに戻る", "← Back to dashboard")}
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {
              t(
                "SUPABASE_SERVICE_ROLE_KEY が未設定のため、Webhook イベントを取得できません。Vercel の環境変数を確認してください。",
                "SUPABASE_SERVICE_ROLE_KEY is missing. Check your Vercel environment variables.",
              )
            }
          </div>
        </main>
      </div>
    );
  }

  const { data, error } = await supabaseAdmin
    .from("stripe_webhook_events")
    .select("id, type, livemode, received_at, processed_at, status, error_message")
    .order("received_at", { ascending: false })
    .limit(100);

  const events = (data ?? []) as WebhookEventRow[];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">
              {t("Webhook運用（管理者）", "Webhook ops (admin)")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={"/admin/billing"} className="btn btn-secondary btn-sm">
              {t("課金設定", "Billing config")}
            </Link>
            <Link href={withLang("/app/vitals")} className="btn btn-secondary btn-sm">
              {t("パフォーマンス監視", "Performance")}
            </Link>
            <Link href={withLang("/app")} className="btn btn-secondary btn-sm">
              {t("← ダッシュボードに戻る", "← Back to dashboard")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-bold text-slate-900">
            {t("Stripe Webhook イベント", "Stripe webhook events")}
          </h1>
          <p className="text-sm text-slate-600">
            {
              t(
                "失敗（failed）イベントをすぐに発見し、Stripe ダッシュボードで Resend（再送）できるようにするための運用ページです。",
                "Ops page to quickly detect failed events and resend them from the Stripe dashboard.",
              )
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {t("取得に失敗しました: ", "Failed to fetch: ")}
            {(error as any)?.message ?? String(error)}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 text-xs text-slate-600">
            {t("最新 100 件（降順）", "Latest 100 (desc)")}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="px-4 py-3">{t("状態", "Status")}</th>
                  <th className="px-4 py-3">{t("イベント", "Event")}</th>
                  <th className="px-4 py-3">{t("受信", "Received")}</th>
                  <th className="px-4 py-3">{t("処理", "Processed")}</th>
                  <th className="px-4 py-3">{t("エラー", "Error")}</th>
                  <th className="px-4 py-3">{t("リンク", "Links")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-slate-600" colSpan={6}>
                      {t("イベントがまだありません。", "No events yet.")}
                    </td>
                  </tr>
                ) : (
                  events.map((e) => {
                    const statusColor =
                      e.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : e.status === "processed"
                          ? "bg-emerald-100 text-emerald-800"
                          : e.status === "processing"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-100 text-slate-700";
                    const stripeEventUrl = e.livemode
                      ? `https://dashboard.stripe.com/events/${e.id}`
                      : `https://dashboard.stripe.com/test/events/${e.id}`;

                    return (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor}`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{e.type}</div>
                          <div className="mt-1 text-[11px] text-slate-500">{e.id}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {new Date(e.received_at).toLocaleString(
                            locale === "en" ? "en-US" : "ja-JP",
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {e.processed_at
                            ? new Date(e.processed_at).toLocaleString(
                                locale === "en" ? "en-US" : "ja-JP",
                              )
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {e.error_message ? (
                            <span className="line-clamp-2">{e.error_message}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/admin/webhooks/${encodeURIComponent(e.id)}`}
                              className="font-medium text-emerald-700 hover:underline"
                            >
                              {t("詳細", "Details")}
                            </Link>
                            <a
                              href={stripeEventUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="font-medium text-slate-700 hover:underline"
                            >
                              {t("Stripeで開く", "Open in Stripe")}
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          <p className="font-semibold text-slate-900">{t("運用メモ", "Ops notes")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>
              {
                t(
                  "status=failed の場合は、Stripe ダッシュボードから対象イベントを開き「再送（Resend）」してください。",
                  "If status=failed, open the event in the Stripe dashboard and click “Resend”.",
                )
              }
            </li>
            <li>
              {
                t(
                  "このアプリは failed イベントの再送を受けたとき、同じ event.id を再処理できるように実装されています。",
                  "This app is implemented to reprocess the same event.id when a failed event is resent.",
                )
              }
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}


