"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Locale } from "@/lib/i18n";

// Stripeの公開キーを環境変数から取得
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

interface StripeCardElementProps {
  clientSecret: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  locale: Locale;
  submitLabel?: string;
}

function CardForm({
  clientSecret,
  onSuccess,
  onError,
  locale,
  submitLabel,
}: StripeCardElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Payment form validation failed");
        onError?.(submitError.message || "Payment form validation failed");
        setLoading(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/settings/billing?status=success`,
        },
      });

      if (confirmError) {
        setError(confirmError.message || "Payment confirmation failed");
        onError?.(confirmError.message || "Payment confirmation failed");
      } else {
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading
          ? locale === "en"
            ? "Processing..."
            : "処理中..."
          : submitLabel ||
            (locale === "en" ? "Add payment method" : "支払い方法を追加")}
      </button>
    </form>
  );
}

export function StripeCardElement({
  clientSecret,
  onSuccess,
  onError,
  locale,
  submitLabel,
}: StripeCardElementProps) {
  return (
    <div className="stripe-card-element">
      <CardForm
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
        locale={locale}
        submitLabel={submitLabel}
      />
    </div>
  );
}

export { stripePromise };

