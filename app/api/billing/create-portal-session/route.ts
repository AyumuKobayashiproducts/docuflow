import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

/**
 * Stripe Customer Portal セッションを作成
 * ユーザーがサブスクリプションを管理（キャンセル、プラン変更など）できる
 */
export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized: missing user session" },
      { status: 401 },
    );
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!stripeSecretKey || !siteUrl) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
  });

  // 個人ユーザーのStripe Customer IDを取得
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  // 組織のStripe Customer IDを取得
  const { data: orgs } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  const customerId =
    userSettings?.stripe_customer_id || orgs?.[0]?.stripe_customer_id;

  if (!customerId) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 400 },
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/settings/billing`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Failed to create billing portal session:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 },
    );
  }
}

