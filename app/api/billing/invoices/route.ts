import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * 請求履歴を取得
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type") as "personal" | "organization" | null;
  const limit = parseInt(searchParams.get("limit") || "12", 10);

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

    if (!customerId) {
      return NextResponse.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return NextResponse.json({ invoices: invoices.data });
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 },
    );
  }
}

/**
 * 請求書をダウンロード
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
  const { invoiceId } = body as { invoiceId: string };

  if (!invoiceId) {
    return NextResponse.json(
      { error: "invoiceId is required" },
      { status: 400 },
    );
  }

  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (!invoice.invoice_pdf) {
      return NextResponse.json(
        { error: "Invoice PDF not available" },
        { status: 404 },
      );
    }

    // PDFのURLを返す（Stripeが生成したPDF）
    return NextResponse.json({ pdfUrl: invoice.invoice_pdf });
  } catch (error) {
    console.error("Failed to get invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to get invoice PDF" },
      { status: 500 },
    );
  }
}

