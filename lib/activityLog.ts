import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { getActiveOrganizationId } from "./organizations";

type ActivityAction =
  | "create_document"
  | "update_document"
  | "delete_document"
  | "archive_document"
  | "restore_document"
  | "toggle_favorite"
  | "toggle_pinned"
  | "enable_share"
  | "disable_share"
  | "add_comment";

type ActivityPayload = {
  documentId?: string;
  documentTitle?: string | null;
  details?: string;
  organizationId?: string | null;
};

export async function logActivity(
  action: ActivityAction,
  payload: ActivityPayload = {}
) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) return;

  const { documentId, documentTitle, details, organizationId } = payload;
  
  // organization_idが明示的に渡されていなければ、アクティブな組織から取得
  const orgId = organizationId !== undefined 
    ? organizationId 
    : await getActiveOrganizationId(userId);

  await supabase.from("activity_logs").insert({
    user_id: userId,
    organization_id: orgId,
    action,
    document_id: documentId ?? null,
    document_title: documentTitle ?? null,
    metadata: details ? { details } : null,
  });
}





