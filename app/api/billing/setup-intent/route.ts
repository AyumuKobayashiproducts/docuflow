import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";
import { BillingScopeError, getBillingScopeOrThrow } from "@/lib/billingScope";
import { getAuthedUserId } from "@/lib/authSession";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * Setup Intentを作成（Stripe Elements用）
 * クライアント側でカード情報を安全に収集するために使用
 */
export async function POST(req: NextRequest) {
  const userId = await getAuthedUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const { type } = body as { type?: "personal" | "organization" };

  try {
    const scope = await getBillingScopeOrThrow(userId, type ?? null);
    let customerId: string | null = scope.customerId;

    // Customerが存在しない場合は作成
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          user_id: userId,
          type: type || "personal",
          ...(scope.type === "organization"
            ? { organization_id: scope.organizationId }
            : {}),
        },
      });
      customerId = customer.id;

      // DBに保存
      if (scope.type === "organization") {
        await supabase
          .from("organizations")
          .update({ stripe_customer_id: customerId })
          .eq("id", scope.organizationId);
      } else {
        await supabase
          .from("user_settings")
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
            },
            { onConflict: "user_id" },
          );
      }
    }

    // Setup Intentを作成
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (error) {
    if (error instanceof BillingScopeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to create setup intent:", error);
    return NextResponse.json(
      { error: "Failed to create setup intent" },
      { status: 500 },
    );
  }
}

