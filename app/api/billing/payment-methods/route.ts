import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";
import { BillingScopeError, getBillingScopeOrThrow } from "@/lib/billingScope";
import { getAuthedUserId } from "@/lib/authSession";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * 支払い方法一覧を取得
 */
export async function GET(req: NextRequest) {
  const userId = await getAuthedUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type") as "personal" | "organization" | null;

  try {
    const scope = await getBillingScopeOrThrow(userId, type);
    const customerId = scope.customerId;

    if (!customerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return NextResponse.json({ paymentMethods: paymentMethods.data });
  } catch (error) {
    console.error("Failed to fetch payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 },
    );
  }
}

/**
 * 支払い方法を追加
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
  const { paymentMethodId, type, setAsDefault } = body as {
    paymentMethodId: string;
    type?: "personal" | "organization";
    setAsDefault?: boolean;
  };

  if (!paymentMethodId) {
    return NextResponse.json(
      { error: "paymentMethodId is required" },
      { status: 400 },
    );
  }

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

    // 支払い方法をCustomerにアタッチ
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // デフォルトに設定する場合
    if (setAsDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // アクティブなサブスクリプションのデフォルト支払い方法も更新
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        await stripe.subscriptions.update(subscriptions.data[0].id, {
          default_payment_method: paymentMethodId,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof BillingScopeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to add payment method:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 },
    );
  }
}

/**
 * 支払い方法を削除
 */
export async function DELETE(req: NextRequest) {
  const userId = await getAuthedUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const paymentMethodId = searchParams.get("paymentMethodId");
  const type = searchParams.get("type") as "personal" | "organization" | null;

  if (!paymentMethodId) {
    return NextResponse.json(
      { error: "paymentMethodId is required" },
      { status: 400 },
    );
  }

  try {
    const scope = await getBillingScopeOrThrow(userId, type);
    const customerId = scope.customerId;
    if (!customerId) {
      return NextResponse.json(
        { error: "No billing customer found" },
        { status: 400 },
      );
    }

    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    const pmCustomer =
      typeof pm.customer === "string"
        ? pm.customer
        : (pm.customer as { id?: string } | null)?.id ?? null;
    if (!pmCustomer || pmCustomer !== customerId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    await stripe.paymentMethods.detach(paymentMethodId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof BillingScopeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to delete payment method:", error);
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 },
    );
  }
}

