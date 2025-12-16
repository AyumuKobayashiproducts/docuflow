import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { acceptInvitation, setActiveOrganization } from "@/lib/organizations";
import { Logo } from "@/components/Logo";
import { getPreferredLocale } from "@/lib/serverLocale";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function InviteAcceptPage({ params }: PageProps) {
  const { token } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  if (!userId) {
    const locale = await getPreferredLocale();
    const loginPath = locale === "en" ? "/en/auth/login" : "/auth/login";
    redirect(`${loginPath}?redirectTo=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const res = await acceptInvitation(token, userId);
  if (!res.success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <Logo />
            <Link
              href="/settings/organizations"
              className="text-sm text-slate-600 hover:underline"
            >
              組織設定へ
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900">
              招待を受け取れませんでした
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {res.error ?? "不明なエラーです。もう一度お試しください。"}
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                href="/settings/organizations"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                組織設定へ
              </Link>
              <Link
                href="/app"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ダッシュボードへ
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (res.organizationId) {
    await setActiveOrganization(res.organizationId);
    redirect(`/settings/organizations?org=${encodeURIComponent(res.organizationId)}`);
  }

  redirect("/settings/organizations");
}


