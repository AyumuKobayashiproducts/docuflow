import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PLAN_LIMITS, type SubscriptionPlan } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    console.warn(
      "[stripe/webhook] STRIPE_SECRET_KEY または STRIPE_WEBHOOK_SECRET が未設定です",
    );
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 500 },
    );
  }

  if (!supabaseAdmin) {
    console.warn(
      "[stripe/webhook] supabaseAdmin が未初期化のため、Webhook を処理できません",
    );
    return NextResponse.json(
      { error: "Supabase admin client is not available" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2024-06-20",
  });

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  // Checkout完了時（新規サブスクリプション）
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.organization_id;
    const userId = session.metadata?.user_id;
    const plan = (session.metadata?.plan as SubscriptionPlan) || "pro";

    const customerId =
      typeof session.customer === "string" ? session.customer : null;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : null;
    const billingEmail = session.customer_details?.email ?? null;

    // サブスクリプション情報を取得
    let subscription: Stripe.Subscription | null = null;
    if (subscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
      } catch (err) {
        console.error(
          "[stripe/webhook] Failed to retrieve subscription:",
          err,
        );
      }
    }

    const subscriptionStatus = subscription?.status || "active";
    const currentPeriodEnd = subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

    const limits = PLAN_LIMITS[plan];

    // 組織プランの場合
    if (orgId) {
      const { error } = await supabaseAdmin
        .from("organizations")
        .update({
          plan,
          seat_limit: limits.seatLimit,
          document_limit: limits.documentLimit,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          billing_email: billingEmail,
        })
        .eq("id", orgId);

      if (error) {
        console.error(
          "[stripe/webhook] Failed to update organization billing info:",
          error,
        );
        return NextResponse.json(
          { error: "Failed to update organization billing info" },
          { status: 500 },
        );
      }
    }

    // 個人ユーザープランの場合
    if (userId) {
      const { error } = await supabaseAdmin
        .from("user_settings")
        .upsert(
          {
            user_id: userId,
            subscription_plan: plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            billing_email: billingEmail,
            subscription_status: subscriptionStatus as
              | "active"
              | "canceled"
              | "past_due"
              | "trialing",
            current_period_end: currentPeriodEnd,
          },
          { onConflict: "user_id" },
        );

      if (error) {
        console.error(
          "[stripe/webhook] Failed to update user subscription info:",
          error,
        );
        return NextResponse.json(
          { error: "Failed to update user subscription info" },
          { status: 500 },
        );
      }
    }
  }

  // サブスクリプション更新時（プラン変更、更新など）
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // サブスクリプションのプラン情報を取得
    const priceId = subscription.items.data[0]?.price.id;
    // プランはmetadataから取得、なければpriceIdから推測
    let plan = (subscription.metadata?.plan as SubscriptionPlan) || "pro";
    
    // priceIdからプランを推測（環境変数と照合）
    if (!subscription.metadata?.plan && priceId) {
      if (priceId === process.env.STRIPE_PRICE_PRO_MONTH) {
        plan = "pro";
      } else if (priceId === process.env.STRIPE_PRICE_TEAM_MONTH) {
        plan = "team";
      } else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTH) {
        plan = "enterprise";
      }
    }

    const limits = PLAN_LIMITS[plan];
    const subscriptionStatus = subscription.status as
      | "active"
      | "canceled"
      | "past_due"
      | "trialing";
    const currentPeriodEnd = new Date(
      subscription.current_period_end * 1000,
    ).toISOString();

    // 組織プランを更新
    const { data: orgs, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    if (orgError) {
      console.error(
        "[stripe/webhook] Failed to fetch organization:",
        orgError,
      );
    } else if (orgs && orgs.length > 0) {
      const orgId = orgs[0].id;
      const { error: updateError } = await supabaseAdmin
        .from("organizations")
        .update({
          plan,
          seat_limit: limits.seatLimit,
          document_limit: limits.documentLimit,
          stripe_subscription_id: subscription.id,
          billing_email: subscription.metadata?.billing_email || null,
        })
        .eq("id", orgId);

      if (updateError) {
        console.error(
          "[stripe/webhook] Failed to update organization:",
          updateError,
        );
      }
    }

    // 個人ユーザープランを更新
    const { data: users, error: userError } = await supabaseAdmin
      .from("user_settings")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    if (userError) {
      console.error(
        "[stripe/webhook] Failed to fetch user:",
        userError,
      );
    } else if (users && users.length > 0) {
      const userId = users[0].user_id;
      const { error: updateError } = await supabaseAdmin
        .from("user_settings")
        .update({
          subscription_plan: plan,
          stripe_subscription_id: subscription.id,
          subscription_status: subscriptionStatus,
          current_period_end: currentPeriodEnd,
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error(
          "[stripe/webhook] Failed to update user subscription:",
          updateError,
        );
      }
    }
  }

  // サブスクリプションキャンセル時
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // 組織プランを無料プランにダウングレード
    const { data: orgs } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    if (orgs && orgs.length > 0) {
      const orgId = orgs[0].id;
      const limits = PLAN_LIMITS.free;

      await supabaseAdmin
        .from("organizations")
        .update({
          plan: "free",
          seat_limit: limits.seatLimit,
          document_limit: limits.documentLimit,
          stripe_subscription_id: null,
        })
        .eq("id", orgId);
    }

    // 個人ユーザープランを無料プランにダウングレード
    const { data: users } = await supabaseAdmin
      .from("user_settings")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    if (users && users.length > 0) {
      const userId = users[0].user_id;

      await supabaseAdmin
        .from("user_settings")
        .update({
          subscription_plan: "free",
          stripe_subscription_id: null,
          subscription_status: "canceled",
          current_period_end: null,
        })
        .eq("user_id", userId);
    }
  }

  // 請求書作成時（支払い成功）
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    // 組織プランの請求書処理
    const { data: orgs } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    if (orgs && orgs.length > 0) {
      // 必要に応じて請求書情報を保存
      console.log(
        `[stripe/webhook] Invoice paid for organization: ${orgs[0].id}`,
      );
    }

    // 個人ユーザープランの請求書処理
    const { data: users } = await supabaseAdmin
      .from("user_settings")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    if (users && users.length > 0) {
      console.log(
        `[stripe/webhook] Invoice paid for user: ${users[0].user_id}`,
      );
    }
  }

  // 請求書支払い失敗時
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    console.warn(
      `[stripe/webhook] Invoice payment failed for customer: ${customerId}`,
    );

    // 必要に応じてユーザーに通知を送信
    // ここではログのみ
  }

  // サブスクリプション試用期間終了時
  if (event.type === "customer.subscription.trial_will_end") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    console.log(
      `[stripe/webhook] Trial will end for customer: ${customerId}`,
    );

    // 必要に応じてユーザーに通知を送信
  }

  return NextResponse.json({ received: true }, { status: 200 });
}









