import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });

  // Legacy cookies
  res.cookies.set("docuhub_ai_auth", "", { path: "/", maxAge: 0 });
  res.cookies.set("docuhub_ai_user_id", "", { path: "/", maxAge: 0 });

  return res;
}


