import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, BarChart3 } from "lucide-react";
import { MarketingSimpleLayout } from "@/components/MarketingSimpleLayout";

export const metadata: Metadata = {
  title: "料金 | DocuFlow",
  description: "DocuFlowの料金プラン一覧です。",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  // LPと同様に Stripe の Price を正として表示（取れない場合はフォールバック）
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const priceIds = {
    pro: process.env.STRIPE_PRICE_PRO_MONTH,
    team: process.env.STRIPE_PRICE_TEAM_MONTH,
  } as const;

  const formatRecurringLabel = (interval?: string | null, intervalCount?: number | null) => {
    if (!interval) return "";
    const count = intervalCount && intervalCount > 1 ? intervalCount : 1;
    const unit =
      interval === "day"
        ? "日"
        : interval === "week"
          ? "週"
          : interval === "month"
            ? "月"
            : interval === "year"
              ? "年"
              : "";
    if (!unit) return "";
    return count === 1 ? `/${unit}` : `/${count}${unit}`;
  };

  const formatCurrency = (currency: string, amount: number) => {
    try {
      const exp = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).resolvedOptions().maximumFractionDigits ?? 2;
      const major = amount / Math.pow(10, exp);
      return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(major);
    } catch {
      return `${amount.toLocaleString()} ${currency.toUpperCase()}`;
    }
  };

  const prices: Partial<
    Record<"pro" | "team", { label: string; recurringLabel: string }>
  > = {};

  if (stripeSecret && (priceIds.pro || priceIds.team)) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
      await Promise.all(
        (Object.keys(priceIds) as Array<keyof typeof priceIds>).map(async (k) => {
          const priceId = priceIds[k];
          if (!priceId) return;
          const price = await stripe.prices.retrieve(priceId);
          if (typeof price.unit_amount !== "number" || !price.currency) return;
          prices[k] = {
            label: formatCurrency(price.currency, price.unit_amount),
            recurringLabel: formatRecurringLabel(
              price.recurring?.interval,
              price.recurring?.interval_count,
            ),
          };
        }),
      );
    } catch {
      // best-effort
    }
  }

  return (
    <MarketingSimpleLayout
      title="料金プラン"
      description="シンプルな料金体系。14日間の無料トライアル付きで、いつでも変更できます。"
    >
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-xs font-medium text-violet-300">
        <BarChart3 className="h-4 w-4" />
        <span>シンプルな料金体系</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
          <div className="text-sm font-medium text-slate-300">Free</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">¥0</span>
            <span className="text-slate-500">/月</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {["50ドキュメントまで", "100MB ストレージ", "AI要約 100回/月"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/auth/signup"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            無料で始める
          </Link>
        </div>

        <div className="relative rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-slate-950/30 p-5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-semibold text-white">
            人気
          </div>
          <div className="text-sm font-medium text-emerald-300">Pro</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{prices.pro?.label ?? "$19"}</span>
            <span className="text-slate-500">{prices.pro?.recurringLabel ?? "/月"}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {["1,000ドキュメント", "5GB ストレージ", "AI要約 5,000回/月", "優先サポート"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/auth/signup?plan=pro"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
          >
            <span>無料で試す</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
          <div className="text-sm font-medium text-sky-300">Team</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{prices.team?.label ?? "$49"}</span>
            <span className="text-slate-500">{prices.team?.recurringLabel ?? "/月"}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {["10,000ドキュメント", "50GB ストレージ", "AI要約 50,000回/月", "10メンバーまで"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/auth/signup?plan=team"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            無料で試す
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
          <div className="text-sm font-medium text-violet-300">Enterprise</div>
          <div className="mt-2 text-2xl font-bold">お問合せ</div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {["無制限ドキュメント", "無制限ストレージ", "無制限AI要約", "SSO / SLA"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <a
            href="mailto:sales@docuflow.io"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            お問い合わせ
          </a>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        ※ 表示価格はベストエフォートでStripeから取得します。取得できない場合はフォールバック表示になります。
      </p>
    </MarketingSimpleLayout>
  );
}


