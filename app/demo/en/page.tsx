import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MarketingSimpleLayoutEn } from "@/components/MarketingSimpleLayoutEn";

export const metadata: Metadata = {
  title: "Demo | DocuFlow",
  description: "A quick product demo (no login required).",
  alternates: { canonical: "/demo/en" },
  robots: { index: false, follow: false },
};

export default function EnglishDemoPage() {
  return (
    <MarketingSimpleLayoutEn
      title="Demo"
      description="A lightweight demo page (no login required)."
    >
      <p className="text-slate-300">
        This is a portfolio demo. For the full experience, create an account.
      </p>

      <h2>What you can do</h2>
      <ul>
        <li>Upload PDFs/Docs and generate summaries/tags</li>
        <li>Search across documents</li>
        <li>Share with expiring links</li>
        <li>Manage organizations with RBAC + audit logs</li>
      </ul>

      <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden bg-slate-950/30">
        <Image
          src="/screenshots/dashboard.png"
          alt="DocuFlow dashboard screenshot"
          width={1400}
          height={900}
          className="w-full"
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          href="/en/auth/signup"
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
        >
          Start free trial
        </Link>
        <Link
          href="/en"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
        >
          Back to landing
        </Link>
      </div>
    </MarketingSimpleLayoutEn>
  );
}


