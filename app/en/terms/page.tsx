import type { Metadata } from "next";
import { MarketingSimpleLayoutEn } from "@/components/MarketingSimpleLayoutEn";

export const metadata: Metadata = {
  title: "Terms of Service | DocuFlow",
  description: "DocuFlow Terms of Service (template).",
  alternates: { canonical: "/en/terms" },
  robots: { index: false, follow: false },
};

export default function TermsEnPage() {
  return (
    <MarketingSimpleLayoutEn
      title="Terms of Service"
      description="Template terms for portfolio/demo use. Replace with real terms before production use."
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-slate-200">
        <p className="text-sm font-semibold">Portfolio template (not legal advice)</p>
        <p className="mt-2 text-sm">
          This page is a placeholder. Do not rely on it for real-world sales. Replace with your
          actual terms before launching.
        </p>
      </div>

      <h2>1. Scope</h2>
      <p>These Terms govern your use of DocuFlow (the “Service”).</p>

      <h2>2. Accounts</h2>
      <p>You are responsible for safeguarding your account and all activity under it.</p>

      <h2>3. Subscription & Billing</h2>
      <p>
        Pricing, billing cycles, and plan limits are displayed in the Service and may change from time to time.
      </p>

      <h2>4. Acceptable Use</h2>
      <ul>
        <li>No unauthorized access, abuse, or security testing without permission.</li>
        <li>No infringement of third-party rights.</li>
        <li>No excessive load or automated scraping that disrupts the Service.</li>
      </ul>

      <h2>5. Content</h2>
      <p>
        You retain ownership of the content you upload. You grant the Service permission to process your content
        to provide features (e.g., indexing, search, AI summaries), subject to the Privacy Policy.
      </p>

      <h2>6. Disclaimer</h2>
      <p>The Service is provided “as is” without warranties of any kind.</p>

      <h2>7. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, the provider is not liable for indirect or consequential damages.</p>

      <h2>8. Governing Law</h2>
      <p>Replace with your governing law and jurisdiction.</p>

      <p className="text-sm text-slate-400">Last updated: 2025-12-16</p>
    </MarketingSimpleLayoutEn>
  );
}
