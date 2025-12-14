import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    redirect(
      `/auth/login?redirectTo=${encodeURIComponent(
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
            <p className="text-sm text-slate-600">{"Webhook運用（管理者）"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={"/admin/webhooks"} className="btn btn-secondary btn-sm">
              {"← 一覧へ戻る"}
            </Link>
            <Link href={"/app"} className="btn btn-secondary btn-sm">
              {"← ダッシュボードに戻る"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">{"イベント詳細"}</h1>
          <p className="mt-1 text-sm text-slate-600">{e.id}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">{"概要"}</h2>
            <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
              <dt className="col-span-1 text-slate-500">{"タイプ"}</dt>
              <dd className="col-span-2 font-medium text-slate-900">{e.type}</dd>

              <dt className="col-span-1 text-slate-500">{"状態"}</dt>
              <dd className="col-span-2 font-medium text-slate-900">{e.status}</dd>

              <dt className="col-span-1 text-slate-500">{"受信"}</dt>
              <dd className="col-span-2 text-slate-700">
                {new Date(e.received_at).toLocaleString("ja-JP")}
              </dd>

              <dt className="col-span-1 text-slate-500">{"処理"}</dt>
              <dd className="col-span-2 text-slate-700">
                {e.processed_at
                  ? new Date(e.processed_at).toLocaleString("ja-JP")
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
                {"Stripeで開く"}
              </a>
              <span className="text-xs text-slate-500">
                {"（Stripe 側の「再送（Resend）」はここから実行できます）"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              {"エラーメッセージ"}
            </h2>
            <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
              {e.error_message ?? "—"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {
                "このメッセージはアプリ側で記録したものです。詳細は Vercel の Function Logs と併せて確認してください。"
              }
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{"保存されたペイロード"}</h2>
          <p className="mt-2 text-xs text-slate-500">
            {"デバッグと監査のため、最小限の情報のみ保存しています。"}
          </p>
          <pre className="mt-3 max-h-[420px] overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
            {JSON.stringify(e.payload, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}


