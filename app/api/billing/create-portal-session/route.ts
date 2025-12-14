import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";
import { getActiveOrganizationId } from "@/lib/organizations";

/**
 * Stripe Customer Portal セッションを作成
 * ユーザーがサブスクリプションを管理（キャンセル、プラン変更など）できる
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    return NextResponse.json(
      { error: "ログインが必要です。" },
      { status: 401 },
    );
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!stripeSecretKey || !siteUrl) {
    return NextResponse.json(
      { error: "Stripe の設定が未完了です（環境変数不足）。" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
  });

  // できるだけ「アクティブ組織」を優先（組織課金を運用しやすくする）
  let customerId: string | null = null;

  const activeOrgId = await getActiveOrganizationId(userId);
  if (activeOrgId) {
    // billing は owner/admin のみ（member は不可）
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", activeOrgId)
      .eq("user_id", userId)
      .maybeSingle();

    const role = (membership as { role?: string } | null)?.role;
    if (role && role !== "member") {
      const { data: org } = await supabase
        .from("organizations")
        .select("stripe_customer_id")
        .eq("id", activeOrgId)
        .maybeSingle();

      customerId = (org as { stripe_customer_id?: string | null } | null)
        ?.stripe_customer_id ?? null;
    }
  }

  // 個人ユーザーのStripe Customer ID（fallback）
  if (!customerId) {
    const { data: userSettings } = await supabase
      .from("user_settings")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();
    customerId =
      (userSettings as { stripe_customer_id?: string | null } | null)
        ?.stripe_customer_id ?? null;
  }

  if (!customerId) {
    return NextResponse.json(
      { error: "有効なサブスクリプションが見つかりません。" },
      { status: 400 },
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/settings/billing`,
    });

    const accept = req.headers.get("accept") ?? "";
    const wantsJson =
      accept.includes("application/json") || accept.includes("+json");

    // フォーム送信（ブラウザ遷移）なら、そのまま Stripe へリダイレクト
    if (!wantsJson) {
      return NextResponse.redirect(session.url, { status: 303 });
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Failed to create billing portal session:", error);
    return NextResponse.json(
      { error: "請求ポータルの作成に失敗しました。" },
      { status: 500 },
    );
  }
}

