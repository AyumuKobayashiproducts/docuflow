import { cookies } from "next/headers";
import { SESSION_COOKIE, getAuthedUserIdFromCookieValue } from "@/lib/sessionCookie";

/**
 * サーバー側で署名付きセッションcookieを検証して userId を返す。
 * - クライアントが自由に改ざんできる cookie（docuhub_ai_user_id 等）には依存しない。
 */
export async function getAuthedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return await getAuthedUserIdFromCookieValue(
    cookieStore.get(SESSION_COOKIE)?.value,
  );
}


