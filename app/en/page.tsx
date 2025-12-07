import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";

export default async function HomeEn() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("docuhub_ai_auth")?.value === "1";

  // If already logged in, go straight to dashboard (same as JA top)
  if (isAuthed) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-emerald-200/40 to-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-violet-200/40 to-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/80 to-transparent rounded-full" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="glass border-b border-slate-200/50 sticky top-0 z-50">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <Logo size="md" />
            <nav className="flex items-center gap-4">
              <Link
                href="/auth/login?lang=en&redirectTo=/app?lang=en"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/login?lang=en&redirectTo=/app?lang=en"
                className="btn btn-primary"
              >
                Get started for free
              </Link>
              {/* Language switch back to Japanese landing */}
              <Link
                href="/"
                className="text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 rounded-full px-2 py-0.5"
                aria-label="Switch to Japanese landing page"
              >
                日本語
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500">
                <span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
              </span>
              <span>AI-powered document workspace</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              Summarize PDFs & Word
              <span className="gradient-text"> in seconds</span>
              <br />
              and stay organized
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed">
              Upload your documents and let AI handle
              <br className="hidden md:block" />
              <strong className="text-slate-800">
                summaries, tags, and smart search
              </strong>{" "}
              for your team.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/login?lang=en&redirectTo=/app?lang=en"
                className="btn btn-primary px-8 py-3.5 text-base"
              >
                <span>Try DocuFlow for free</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/auth/login?lang=en&redirectTo=/app?lang=en"
                className="btn btn-secondary px-8 py-3.5 text-base"
              >
                <span>Log in</span>
              </Link>
            </div>

            {/* Trust Badge */}
            <p className="mt-6 text-xs text-slate-500">
              ✓ No credit card required &nbsp; ✓ Designed for small product teams
            </p>
          </div>

          {/* Hero Image / Screenshot */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-slate-400">
                    docuflow-azure.vercel.app
                  </span>
                </div>
              </div>
              <Image
                src="/screenshots/dashboard-en.png"
                alt="DocuFlow dashboard"
                width={1200}
                height={800}
                className="w-full"
                priority
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


