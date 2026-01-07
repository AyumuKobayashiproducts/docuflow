import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getAuthedUserId } from "@/lib/authSession";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getAuthedUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "ログインが必要です。" },
      { status: 401 },
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        error:
          "エクスポート機能は現在利用できません（サーバー設定が未完了です）。",
      },
      { status: 500 },
    );
  }

  // 乱打・誤操作で重いエクスポートを連発されないように簡易レート制限（デモ用途）
  const rateKey = `export:${userId}`;
  if (!checkRateLimit(rateKey, 10)) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  // NOTE:
  // - Supabase Service Role を使うため、必ず user_id で絞り込み、他ユーザーのデータが混ざらないようにする
  // - エクスポート対象は「ユーザー本人が作成したデータ」に限定（組織データの完全エクスポートは将来対応）
  const [documentsRes, commentsRes, activityRes, notificationsRes] =
    await Promise.all([
      supabaseAdmin
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(5000),
      supabaseAdmin
        .from("document_comments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(5000),
      supabaseAdmin
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(2000),
      supabaseAdmin
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(500),
    ]);

  if (documentsRes.error) {
    console.error("[api/export] documents error:", documentsRes.error);
  }
  if (commentsRes.error) {
    console.error("[api/export] comments error:", commentsRes.error);
  }
  if (activityRes.error) {
    console.error("[api/export] activity error:", activityRes.error);
  }
  if (notificationsRes.error) {
    console.error("[api/export] notifications error:", notificationsRes.error);
  }

  const payload = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    documents: documentsRes.data ?? [],
    document_comments: commentsRes.data ?? [],
    activity_logs: activityRes.data ?? [],
    notifications: notificationsRes.data ?? [],
  };

  const body = JSON.stringify(payload, null, 2);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="docuflow-export.json"',
    },
  });
}









