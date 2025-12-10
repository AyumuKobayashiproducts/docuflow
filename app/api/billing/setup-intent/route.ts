import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * Setup Intentを作成（Stripe Elements用）
 * クライアント側でカード情報を安全に収集するために使用
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const { type } = body as { type?: "personal" | "organization" };

  try {
    let customerId: string | null = null;

    if (type === "organization") {
      const { data: orgs } = await supabase
        .from("organizations")
        .select("stripe_customer_id")
        .eq("owner_id", userId)
        .order("created_at", { ascending: true })
        .limit(1);

      customerId = orgs?.[0]?.stripe_customer_id || null;
    } else {
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle();

      customerId = userSettings?.stripe_customer_id || null;
    }

    // Customerが存在しない場合は作成
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          user_id: userId,
          type: type || "personal",
        },
      });
      customerId = customer.id;

      // DBに保存
      if (type === "organization") {
        const { data: orgs } = await supabase
          .from("organizations")
          .select("id")
          .eq("owner_id", userId)
          .order("created_at", { ascending: true })
          .limit(1);

        if (orgs?.[0]) {
          await supabase
            .from("organizations")
            .update({ stripe_customer_id: customerId })
            .eq("id", orgs[0].id);
        }
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
    console.error("Failed to create setup intent:", error);
    return NextResponse.json(
      { error: "Failed to create setup intent" },
      { status: 500 },
    );
  }
}

