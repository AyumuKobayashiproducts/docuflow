"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutEnPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } finally {
        if (!active) return;
        router.replace("/en/auth/login");
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-600">Logging out…</p>
    </div>
  );
}


