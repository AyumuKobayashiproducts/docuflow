import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPreferredLocale } from "@/lib/serverLocale";
import { getAuthedUserId } from "@/lib/authSession";

type WebhookEventRow = {
  id: string;
  type: string;
  livemode: boolean;
  received_at: string;
  processed_at: string | null;
  status: "processing" | "processed" | "failed" | "ignored";
  error_message: string | null;
  payload: unknown | null;
};

function getOwnerUserId(): string | null {
  const ownerUserId = process.env.DOCUFLOW_OWNER_USER_ID;
  return ownerUserId && ownerUserId.trim().length > 0 ? ownerUserId.trim() : null;
}

export default async function AdminStripeWebhookEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getPreferredLocale();
  const t = (ja: string, en: string) => (locale === "en" ? en : ja);
  const withLang = (href: string) => {
    if (locale !== "en") return href;
    if (href.includes("lang=en")) return href;
    if (href.includes("?")) return `${href}&lang=en`;
    return `${href}?lang=en`;
  };

  const { id } = await params;
  const userId = await getAuthedUserId();

  if (!userId) {
    const loginPath = locale === "en" ? "/en/auth/login" : "/auth/login";
    redirect(
      `${loginPath}?redirectTo=${encodeURIComponent(
        `/admin/webhooks/${encodeURIComponent(id)}`,
      )}`,
    );
  }

  const ownerUserId = getOwnerUserId();
  if (!ownerUserId) return notFound();
  if (userId !== ownerUserId) return notFound();

  if (!supabaseAdmin) return notFound();

  const { data, error } = await supabaseAdmin
    .from("stripe_webhook_events")
    .select(
      "id, type, livemode, received_at, processed_at, status, error_message, payload",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return notFound();

  const e = data as WebhookEventRow;
  const stripeEventUrl = e.livemode
    ? `https://dashboard.stripe.com/events/${e.id}`
    : `https://dashboard.stripe.com/test/events/${e.id}`;

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
            <Link href={"/admin/webhooks"} className="btn btn-secondary btn-sm">
              {t("← 一覧へ戻る", "← Back to list")}
            </Link>
            <Link href={withLang("/app")} className="btn btn-secondary btn-sm">
              {t("← ダッシュボードに戻る", "← Back to dashboard")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            {t("イベント詳細", "Event details")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{e.id}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              {t("概要", "Overview")}
            </h2>
            <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
              <dt className="col-span-1 text-slate-500">{t("タイプ", "Type")}</dt>
              <dd className="col-span-2 font-medium text-slate-900">{e.type}</dd>

              <dt className="col-span-1 text-slate-500">
                {t("状態", "Status")}
              </dt>
              <dd className="col-span-2 font-medium text-slate-900">{e.status}</dd>

              <dt className="col-span-1 text-slate-500">
                {t("受信", "Received")}
              </dt>
              <dd className="col-span-2 text-slate-700">
                {new Date(e.received_at).toLocaleString(
                  locale === "en" ? "en-US" : "ja-JP",
                )}
              </dd>

              <dt className="col-span-1 text-slate-500">
                {t("処理", "Processed")}
              </dt>
              <dd className="col-span-2 text-slate-700">
                {e.processed_at
                  ? new Date(e.processed_at).toLocaleString(
                      locale === "en" ? "en-US" : "ja-JP",
                    )
                  : "—"}
              </dd>
            </dl>

            <div className="mt-4 flex items-center gap-3">
              <a
                href={stripeEventUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
              >
                {t("Stripeで開く", "Open in Stripe")}
              </a>
              <span className="text-xs text-slate-500">
                {t(
                  "（Stripe 側の「再送（Resend）」はここから実行できます）",
                  "(You can run Stripe “Resend” from here)",
                )}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              {t("エラーメッセージ", "Error message")}
            </h2>
            <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
              {e.error_message ?? "—"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {t(
                "このメッセージはアプリ側で記録したものです。詳細は Vercel の Function Logs と併せて確認してください。",
                "This message is recorded by the app. Check Vercel Function Logs for details.",
              )}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            {t("保存されたペイロード", "Stored payload")}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            {t(
              "デバッグと監査のため、最小限の情報のみ保存しています。",
              "We store only the minimal data needed for debugging and audit.",
            )}
          </p>
          <pre className="mt-3 max-h-[420px] overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
            {JSON.stringify(e.payload, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}


