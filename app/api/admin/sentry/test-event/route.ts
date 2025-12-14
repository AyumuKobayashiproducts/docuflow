import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { captureEvent } from "@/lib/sentry";

export const dynamic = "force-dynamic";

function getOwnerUserId(): string | null {
  const ownerUserId = process.env.DOCUFLOW_OWNER_USER_ID;
  return ownerUserId && ownerUserId.trim().length > 0 ? ownerUserId.trim() : null;
}

const ALLOWED_ACTIONS = new Set([
  // ops (汎用テスト)
  "ops.sentry.test_event",
  // billing
  "billing.invoice.payment_failed",
  "billing.webhook.config_missing",
  "billing.webhook.supabase_admin_missing",
  // org
  "org.ownership.transferred",
  "org.deleted",
  "org.member.removed",
]);

function inferDomain(action: string): "ops" | "billing" | "org" {
  if (action.startsWith("billing.")) return "billing";
  if (action.startsWith("org.")) return "org";
  return "ops";
}

/**
 * オーナー専用: Sentryへタグ付きイベントを送信するテストAPI
 *
 * 例:
 * - /api/admin/sentry/test-event?action=billing.invoice.payment_failed
 * - /api/admin/sentry/test-event?action=org.ownership.transferred
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  if (!userId) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const ownerUserId = getOwnerUserId();
  if (!ownerUserId) {
    // 管理機能を隠す（設定漏れ時）
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  if (userId !== ownerUserId) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const action = req.nextUrl.searchParams.get("action") ?? "ops.sentry.test_event";
  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      {
        error: "Unsupported action",
        allowed: Array.from(ALLOWED_ACTIONS.values()),
      },
      { status: 400 },
    );
  }

  const domain = inferDomain(action);
  const testEventId = crypto.randomUUID();
  const message = `Sentry test event (${action}) ${testEventId}`;

  // NOTE:
  // - message にUUIDを入れて毎回「新しいIssue」になりやすくし、アラート動作確認を簡単にする
  //   ただし Sentry のグルーピングは UUID を正規化して同一 Issue にまとめることがあるため、
  //   fingerprint をユニークにして確実に「新規 Issue」にする
  // - PIIは送らない（userIdは運用上必要な範囲のため extra にのみ入れる）
  captureEvent(
    message,
    {
      tags: { domain, action },
      fingerprint: ["docuflow.sentry_test_event", action, testEventId],
      extra: {
        testEventId,
        actorUserId: userId,
        issuedAt: new Date().toISOString(),
      },
    },
    "warning",
  );

  return NextResponse.json({
    ok: true,
    message,
    tags: { domain, action },
    extra: { testEventId },
  });
}


