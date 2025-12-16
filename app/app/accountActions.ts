"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPreferredLocale } from "@/lib/serverLocale";

export async function deleteAccount() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  if (!userId) return;

  if (!supabaseAdmin) {
    console.warn(
      "[deleteAccount] supabaseAdmin が未設定のため、アカウント削除は無効です。SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください。",
    );
    return;
  }

  await supabase.from("document_versions").delete().eq("user_id", userId);
  await supabase.from("documents").delete().eq("user_id", userId);

  await supabaseAdmin.auth.admin.deleteUser(userId);

  const locale = await getPreferredLocale();
  const logoutPath = locale === "en" ? "/en/auth/logout" : "/auth/logout";
  redirect(`${logoutPath}?accountDeleted=1`);
}
