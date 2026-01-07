import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";
import { Logo } from "@/components/Logo";
import { getPreferredLocale } from "@/lib/serverLocale";
import { getAuthedUserId } from "@/lib/authSession";

function getOwnerUserId(): string | null {
  const ownerUserId = process.env.DOCUFLOW_OWNER_USER_ID;
  return ownerUserId && ownerUserId.trim().length > 0 ? ownerUserId.trim() : null;
}

function getStripeDashboardBaseUrl(stripeSecretKey: string) {
  return stripeSecretKey.startsWith("sk_live")
    ? "https://dashboard.stripe.com"
    : "https://dashboard.stripe.com/test";
}

function formatMoneyFromUnitAmount(
  locale: "ja" | "en",
  currency: string,
  unitAmount: number,
) {
  try {
    const exp =
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).resolvedOptions().maximumFractionDigits ?? 2;
    const major = unitAmount / Math.pow(10, exp);
    return new Intl.NumberFormat(locale === "en" ? "en-US" : "ja-JP", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(major);
  } catch {
    return `${unitAmount.toLocaleString()} ${currency.toUpperCase()}`;
  }
}

export default async function AdminBillingConfigPage() {
  const locale = await getPreferredLocale();
  const t = (ja: string, en: string) => (locale === "en" ? en : ja);
  const withLang = (href: string) => {
    if (locale !== "en") return href;
    if (href.includes("lang=en")) return href;
    if (href.includes("?")) return `${href}&lang=en`;
    return `${href}?lang=en`;
  };

  const userId = await getAuthedUserId();
  if (!userId) {
    const loginPath = locale === "en" ? "/en/auth/login" : "/auth/login";
    redirect(`${loginPath}?redirectTo=${encodeURIComponent("/admin/billing")}`);
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
                {t("課金設定（管理者）", "Billing config (admin)")}
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
            ? t(
                "STRIPE_SECRET_KEY / NEXT_PUBLIC_SITE_URL が未設定です",
                "STRIPE_SECRET_KEY / NEXT_PUBLIC_SITE_URL is missing",
              )
            : t(`${r.envKey} が未設定です`, `${r.envKey} is missing`),
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
            : t(
                "USD/月額になっていない可能性があります（Stripe側のPrice設定を確認）",
                "It may not be USD/month (check the Stripe Price settings)",
              ),
        };
      } catch (e) {
        return {
          ...r,
          ok: false,
          currency: null,
          unitAmount: null,
          interval: null,
          intervalCount: null,
          error: t(
            `Stripeから価格情報を取得できませんでした: ${String(e)}`,
            `Failed to fetch price from Stripe: ${String(e)}`,
          ),
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
              <p className="text-sm text-slate-600">
                {t("課金設定（管理者）", "Billing config (admin)")}
              </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={"/admin/webhooks"} className="btn btn-secondary btn-sm">
                {t("Webhook運用", "Webhook ops")}
            </Link>
              <Link href={withLang("/app")} className="btn btn-secondary btn-sm">
                {t("← ダッシュボードに戻る", "← Back to dashboard")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            {t(
              "Stripe 価格設定チェック（USD統一）",
              "Stripe price config check (USD)",
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {
              t(
                "アプリ表示・Checkout・Webhookの整合性を保つため、価格はStripeのPriceを正とします。ここでUSD/月額になっているか確認します。",
                "To keep the app display / Checkout / webhooks consistent, Stripe Prices are the source of truth. Confirm prices are in USD/month here.",
              )
            }
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">
                {t("サーバー設定", "Server config")}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>
                  {"STRIPE_SECRET_KEY: "}
                  <span className="font-medium">
                    {stripeSecretKey ? t("設定済み", "set") : t("未設定", "missing")}
                  </span>
                </li>
                <li>
                  {"NEXT_PUBLIC_SITE_URL: "}
                  <span className="font-medium">{siteUrl ?? t("未設定", "missing")}</span>
                </li>
                <li>
                  {"STRIPE_WEBHOOK_SECRET: "}
                  <span className="font-medium">
                    {webhookSecret ? t("設定済み", "set") : t("未設定", "missing")}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">
                {t("Stripe ダッシュボード", "Stripe dashboard")}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <a
                    href={`${dashboardBase}/products`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-slate-800 hover:underline"
                  >
                    {t(
                      "商品カタログ（Products）を開く",
                      "Open product catalog (Products)",
                    )}
                  </a>
                </li>
                <li>
                  <a
                    href={`${dashboardBase}/prices`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-slate-800 hover:underline"
                  >
                    {t("価格（Prices）を開く", "Open prices (Prices)")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              {t("Price一覧", "Prices")}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="px-6 py-3">{t("プラン", "Plan")}</th>
                  <th className="px-6 py-3">{t("環境変数", "Env var")}</th>
                  <th className="px-6 py-3">{"price_id"}</th>
                  <th className="px-6 py-3">{t("通貨", "Currency")}</th>
                  <th className="px-6 py-3">{t("金額", "Amount")}</th>
                  <th className="px-6 py-3">{t("周期", "Interval")}</th>
                  <th className="px-6 py-3">{t("判定", "Result")}</th>
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
                          ? formatMoneyFromUnitAmount(locale, r.currency, r.unitAmount)
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
                            {r.ok ? "OK" : t("要確認", "Check")}
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
            {t("次の確認手順（最短）", "Next checks (quick)")}
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>
              {
                t(
                  "`/settings/billing` で Pro/Team の価格が USD で表示されていることを確認",
                  "Confirm Pro/Team prices are shown in USD on `/settings/billing`",
                )
              }
            </li>
            <li>
              {t(
                "Team → アップグレード → Stripe Checkout で $49/月 が出ることを確認",
                "Upgrade to Team and confirm Stripe Checkout shows $49/month",
              )}
            </li>
            <li>
              {t(
                "支払い完了後、`/admin/webhooks` で該当イベントが processed になることを確認",
                "After payment, confirm the event becomes processed on `/admin/webhooks`",
              )}
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}


