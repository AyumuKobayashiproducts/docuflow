"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/useLocale";

export default function LogoutPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } finally {
        if (!active) return;
        const loginPath = locale === "en" ? "/en/auth/login" : "/auth/login";
        router.replace(loginPath);
      }
    })();

    return () => {
      active = false;
    };
  }, [router, locale]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-600">
        DocuFlow からログアウトしています...
      </p>
    </div>
  );
}
