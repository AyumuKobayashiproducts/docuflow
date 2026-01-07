import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SESSION_COOKIE, signSessionCookieValue } from "@/lib/sessionCookie";

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const cookieSecret = process.env.AUTH_COOKIE_SECRET ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase env is missing." },
      { status: 500 },
    );
  }
  if (!cookieSecret) {
    return NextResponse.json(
      { error: "AUTH_COOKIE_SECRET is missing." },
      { status: 500 },
    );
  }

  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token =
    auth && auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Missing access token." }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return NextResponse.json(
      { error: "Invalid token." },
      { status: 401 },
    );
  }

  const value = await signSessionCookieValue(data.user.id, {
    secret: cookieSecret,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  // Clear legacy insecure cookies if present
  res.cookies.set("docuhub_ai_auth", "", { path: "/", maxAge: 0 });
  res.cookies.set("docuhub_ai_user_id", "", { path: "/", maxAge: 0 });

  return res;
}


