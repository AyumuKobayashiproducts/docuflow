import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabaseClient";

type OrganizationRow = {
  id: string;
  name: string;
  plan: "free" | "pro" | "team";
  seat_limit: number | null;
  document_limit: number | null;
};

export default async function BillingSettingsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    redirect("/auth/login?redirectTo=/settings/billing");
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name, plan, seat_limit, document_limit")
    .order("created_at", { ascending: true })
    .limit(5);

  const primaryOrg = (organizations ?? [])[0] as OrganizationRow | undefined;

  const stripeConfigured =
    !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_PRO_MONTH;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">課金・プラン設定</p>
          </div>
          <Link
            href="/settings"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← 設定トップへ戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            現在のプラン
          </h2>
          {!primaryOrg ? (
            <p className="text-xs text-slate-600">
              まだ組織が作成されていません。まずは{" "}
              <Link
                href="/settings/organizations"
                className="font-medium text-emerald-600 underline-offset-2 hover:underline"
              >
                組織設定
              </Link>
              からチームを作成してください。
            </p>
          ) : (
            <div className="space-y-3 text-xs text-slate-700">
              <p>
                組織名: <span className="font-medium">{primaryOrg.name}</span>
              </p>
              <p>
                プラン:{" "}
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800">
                  {primaryOrg.plan.toUpperCase()}
                </span>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold text-slate-600">
                    メンバー数の上限
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    {primaryOrg.seat_limit ?? "無制限（現在はソフト制限のみ）"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    `organization_members` の件数がこの値を超える場合、UI
                    上で制限をかける想定です。
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold text-slate-600">
                    ドキュメント数の上限
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    {primaryOrg.document_limit ?? "無制限（現在はソフト制限のみ）"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    `documents` の件数ベースで制御する設計です。
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-emerald-900">
            Pro / Team プランへのアップグレード
          </h2>
          <p className="text-xs text-emerald-900">
            Stripe Checkout 連携を前提とした設計になっています。詳細は{" "}
            <Link
              href="/docs/#/billing"
              className="font-medium underline underline-offset-2"
            >
              Billing ドキュメント
            </Link>
            を参照してください。
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              disabled={!stripeConfigured}
            >
              Pro にアップグレード（Stripe Checkout）
            </button>
            {!stripeConfigured && (
              <span className="text-[11px] text-emerald-900">
                環境変数 <code>STRIPE_SECRET_KEY</code>,{" "}
                <code>STRIPE_PRICE_PRO_MONTH</code> が未設定のため、現在は UI
                デモのみ有効です。
              </span>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}


