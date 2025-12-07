"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getLocaleFromParam } from "@/lib/i18n";

export default function LogoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale: Locale = getLocaleFromParam(searchParams.get("lang") || undefined);

  useEffect(() => {
    // 認証用クッキーを削除
    document.cookie = "docuhub_ai_auth=; path=/; max-age=0";
    document.cookie = "docuhub_ai_user_id=; path=/; max-age=0";
    const loginPath = locale === "en" ? "/auth/login?lang=en" : "/auth/login";
    router.replace(loginPath);
  }, [router, locale]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-600">
        {locale === "en"
          ? "Logging you out from DocuFlow..."
          : "DocuFlow からログアウトしています..."}
      </p>
    </div>
  );
}
