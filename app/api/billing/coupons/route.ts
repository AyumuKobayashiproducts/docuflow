import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * クーポンコードを検証
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { couponCode } = body as { couponCode: string };

  if (!couponCode) {
    return NextResponse.json(
      { error: "couponCode is required" },
      { status: 400 },
    );
  }

  try {
    const coupon = await stripe.coupons.retrieve(couponCode);

    if (!coupon.valid) {
      return NextResponse.json(
        { error: "Invalid or expired coupon" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      discount: {
        percent_off: coupon.percent_off,
        amount_off: coupon.amount_off,
        currency: coupon.currency,
        duration: coupon.duration,
        duration_in_months: coupon.duration_in_months,
      },
    });
  } catch (error) {
    console.error("Failed to validate coupon:", error);
    return NextResponse.json(
      { error: "Invalid coupon code" },
      { status: 400 },
    );
  }
}

