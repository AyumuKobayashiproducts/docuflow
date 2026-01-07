"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPreferredLocale } from "@/lib/serverLocale";
import { getAuthedUserId } from "@/lib/authSession";

export async function deleteAccount() {
  const userId = await getAuthedUserId();
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
