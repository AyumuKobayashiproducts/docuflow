import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { BillingScopeError, getBillingScopeOrThrow } from "@/lib/billingScope";

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
    const scope = await getBillingScopeOrThrow(userId, type);
    const customerId = scope.customerId;

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
  const { invoiceId, type } = body as {
    invoiceId: string;
    type?: "personal" | "organization";
  };

  if (!invoiceId) {
    return NextResponse.json(
      { error: "invoiceId is required" },
      { status: 400 },
    );
  }

  try {
    const scope = await getBillingScopeOrThrow(userId, type ?? null);
    const customerId = scope.customerId;
    if (!customerId) {
      return NextResponse.json(
        { error: "No billing customer found" },
        { status: 400 },
      );
    }

    const invoice = await stripe.invoices.retrieve(invoiceId);
    const invCustomer =
      typeof invoice.customer === "string"
        ? invoice.customer
        : (invoice.customer as { id?: string } | null)?.id ?? null;
    if (!invCustomer || invCustomer !== customerId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    if (!invoice.invoice_pdf) {
      return NextResponse.json(
        { error: "Invoice PDF not available" },
        { status: 404 },
      );
    }

    // PDFのURLを返す（Stripeが生成したPDF）
    return NextResponse.json({ pdfUrl: invoice.invoice_pdf });
  } catch (error) {
    if (error instanceof BillingScopeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to get invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to get invoice PDF" },
      { status: 500 },
    );
  }
}

