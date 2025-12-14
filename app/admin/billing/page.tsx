import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";
import { Logo } from "@/components/Logo";

function getOwnerUserId(): string | null {
  const ownerUserId = process.env.DOCUFLOW_OWNER_USER_ID;
  return ownerUserId && ownerUserId.trim().length > 0 ? ownerUserId.trim() : null;
}

function getStripeDashboardBaseUrl(stripeSecretKey: string) {
  return stripeSecretKey.startsWith("sk_live")
    ? "https://dashboard.stripe.com"
    : "https://dashboard.stripe.com/test";
}

function formatMoneyFromUnitAmount(currency: string, unitAmount: number) {
  try {
    const exp =
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).resolvedOptions().maximumFractionDigits ?? 2;
    const major = unitAmount / Math.pow(10, exp);
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(major);
  } catch {
    return `${unitAmount.toLocaleString()} ${currency.toUpperCase()}`;
  }
}

export default async function AdminBillingConfigPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  if (!userId) {
    redirect(`/auth/login?redirectTo=${encodeURIComponent("/admin/billing")}`);
  }

  const ownerUserId = getOwnerUserId();
  if (!ownerUserId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Logo />
              <p className="text-sm text-slate-600">{"課金設定（管理者）"}</p>
            </div>
            <Link href={"/app"} className="btn btn-secondary btn-sm">
              {"← ダッシュボードに戻る"}
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">{"管理ページが未設定です"}</p>
            <p className="mt-2">
              {
                "Vercel の環境変数に DOCUFLOW_OWNER_USER_ID（あなたの user_id）を追加し、Redeploy してください。"
              }
            </p>
            <p className="mt-2 text-xs text-amber-800">
              {"あなたの user_id（ログイン中）: "}
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

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const pricePro = process.env.STRIPE_PRICE_PRO_MONTH;
  const priceTeam = process.env.STRIPE_PRICE_TEAM_MONTH;
  const priceEnterprise = process.env.STRIPE_PRICE_ENTERPRISE_MONTH;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const stripeConfigured = !!stripeSecretKey && !!siteUrl;

  const stripe =
    stripeSecretKey && stripeConfigured
      ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
      : null;

  const dashboardBase = stripeSecretKey
    ? getStripeDashboardBaseUrl(stripeSecretKey)
    : "https://dashboard.stripe.com/test";

  const priceRows = [
    { plan: "pro", envKey: "STRIPE_PRICE_PRO_MONTH", priceId: pricePro },
    { plan: "team", envKey: "STRIPE_PRICE_TEAM_MONTH", priceId: priceTeam },
    {
      plan: "enterprise",
      envKey: "STRIPE_PRICE_ENTERPRISE_MONTH",
      priceId: priceEnterprise,
    },
  ] as const;

  const resolved = await Promise.all(
    priceRows.map(async (r) => {
      if (!stripe || !r.priceId) {
        return {
          ...r,
          ok: false,
          currency: null as string | null,
          unitAmount: null as number | null,
          interval: null as string | null,
          intervalCount: null as number | null,
          error: !stripe
            ? "STRIPE_SECRET_KEY / NEXT_PUBLIC_SITE_URL が未設定です"
            : `${r.envKey} が未設定です`,
        };
      }
      try {
        const price = await stripe.prices.retrieve(r.priceId);
        const currency = price.currency ?? null;
        const unitAmount =
          typeof price.unit_amount === "number" ? price.unit_amount : null;
        const interval = price.recurring?.interval ?? null;
        const intervalCount = price.recurring?.interval_count ?? null;

        const ok =
          !!currency &&
          currency.toLowerCase() === "usd" &&
          !!interval &&
          interval === "month";

        return {
          ...r,
          ok,
          currency,
          unitAmount,
          interval,
          intervalCount,
          error: ok
            ? null
            : "USD/月額になっていない可能性があります（Stripe側のPrice設定を確認）",
        };
      } catch (e) {
        return {
          ...r,
          ok: false,
          currency: null,
          unitAmount: null,
          interval: null,
          intervalCount: null,
          error: `Stripeから価格情報を取得できませんでした: ${String(e)}`,
        };
      }
    }),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">{"課金設定（管理者）"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={"/admin/webhooks"} className="btn btn-secondary btn-sm">
              {"Webhook運用"}
            </Link>
            <Link href={"/app"} className="btn btn-secondary btn-sm">
              {"← ダッシュボードに戻る"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            {"Stripe 価格設定チェック（USD統一）"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {
              "アプリ表示・Checkout・Webhookの整合性を保つため、価格はStripeのPriceを正とします。ここでUSD/月額になっているか確認します。"
            }
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">{"サーバー設定"}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>
                  {"STRIPE_SECRET_KEY: "}
                  <span className="font-medium">
                    {stripeSecretKey ? "設定済み" : "未設定"}
                  </span>
                </li>
                <li>
                  {"NEXT_PUBLIC_SITE_URL: "}
                  <span className="font-medium">{siteUrl ?? "未設定"}</span>
                </li>
                <li>
                  {"STRIPE_WEBHOOK_SECRET: "}
                  <span className="font-medium">
                    {webhookSecret ? "設定済み" : "未設定"}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">{"Stripe ダッシュボード"}</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <a
                    href={`${dashboardBase}/products`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-slate-800 hover:underline"
                  >
                    {"商品カタログ（Products）を開く"}
                  </a>
                </li>
                <li>
                  <a
                    href={`${dashboardBase}/prices`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-slate-800 hover:underline"
                  >
                    {"価格（Prices）を開く"}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">{"Price一覧"}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="px-6 py-3">{"プラン"}</th>
                  <th className="px-6 py-3">{"環境変数"}</th>
                  <th className="px-6 py-3">{"price_id"}</th>
                  <th className="px-6 py-3">{"通貨"}</th>
                  <th className="px-6 py-3">{"金額"}</th>
                  <th className="px-6 py-3">{"周期"}</th>
                  <th className="px-6 py-3">{"判定"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resolved.map((r) => {
                  const statusBadge = r.ok
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900";

                  return (
                    <tr key={r.envKey} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-900">
                        {r.plan.toUpperCase()}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-700">
                        {r.envKey}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-700">
                        {r.priceId ? (
                          <a
                            href={`${dashboardBase}/prices/${r.priceId}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="font-medium text-slate-800 hover:underline"
                          >
                            {r.priceId}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-700">
                        {r.currency?.toUpperCase() ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-900">
                        {r.currency && typeof r.unitAmount === "number"
                          ? formatMoneyFromUnitAmount(r.currency, r.unitAmount)
                          : "—"}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-700">
                        {r.interval
                          ? `${r.intervalCount && r.intervalCount > 1 ? r.intervalCount : 1} ${r.interval}`
                          : "—"}
                      </td>
                      <td className="px-6 py-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadge}`}
                          >
                            {r.ok ? "OK" : "要確認"}
                          </span>
                          {r.error && (
                            <div className="text-[11px] text-slate-600">
                              {r.error}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            {"次の確認手順（最短）"}
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>
              {
                "`/settings/billing` で Pro/Team の価格が USD で表示されていることを確認"
              }
            </li>
            <li>
              {"Team → アップグレード → Stripe Checkout で $49/月 が出ることを確認"}
            </li>
            <li>
              {"支払い完了後、`/admin/webhooks` で該当イベントが processed になることを確認"}
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}


