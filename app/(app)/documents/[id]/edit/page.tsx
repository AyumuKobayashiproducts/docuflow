import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { generateSummaryAndTags } from "@/lib/ai";
import { logActivity } from "@/lib/activityLog";
import { getEffectivePlan } from "@/lib/subscription";
import { ensureAndConsumeAICalls } from "@/lib/aiUsage";
import { canUseStorage } from "@/lib/subscriptionUsage";
import { getLocaleFromParam, type Locale } from "@/lib/i18n";
import { updateDocumentEmbedding } from "@/lib/similarSearch";

const BYTES_PER_MB = 1024 * 1024;

type PageProps = {
  params: {
    id: string;
  };
  searchParams?:
    | {
        lang?: string;
      }
    | Promise<{
        lang?: string;
      }>;
};

async function updateDocument(formData: FormData) {
  "use server";

  const locale: Locale = getLocaleFromParam(String(formData.get("lang") ?? ""));
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const rawContent = String(formData.get("rawContent") ?? "").trim();

  if (!id || !title || !rawContent) {
    return;
  }

  const cookieStore = await cookies();
  const cookieUserId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  if (!cookieUserId) {
    throw new Error(locale === "en" ? "Please log in." : "ログインしてください。");
  }

  // 現在のドキュメントを取得（スコープ判定 / 上限チェック / バージョン保存に使用）
  const { data: current, error: currentError } = await supabase
    .from("documents")
    .select("id, user_id, organization_id, title, category, raw_content, summary, tags")
    .eq("id", id)
    .eq("user_id", cookieUserId)
    .single();

  if (currentError || !current) {
    console.error("[updateDocument] failed to fetch current doc:", currentError);
    throw new Error(
      locale === "en" ? "Document not found." : "ドキュメントが見つかりません。",
    );
  }

  const currentDoc = current as {
    id: string;
    user_id: string | null;
    organization_id: string | null;
    title: string;
    category: string | null;
    raw_content: string | null;
    summary: string | null;
    tags: string[] | null;
  };

  // ストレージ容量チェック（編集で本文が増える場合）※ここは必ず強制
  const oldBytes = new Blob([currentDoc.raw_content ?? ""]).size;
  const newBytes = new Blob([rawContent]).size;
  const additionalMB = Math.max(0, (newBytes - oldBytes) / BYTES_PER_MB);
  if (additionalMB > 0) {
    const storageCheck = await canUseStorage(
      cookieUserId,
      currentDoc.organization_id ?? null,
      additionalMB,
      locale,
    );
    if (!storageCheck.allowed) {
      throw new Error(storageCheck.reason || "Storage limit exceeded");
    }
  }

  // 変更前の内容を document_versions に保存してから本体を更新する（失敗しても本体更新は続行）
  try {
    const { limits } = await getEffectivePlan(
      cookieUserId,
      currentDoc.organization_id ?? null,
    );

    // バージョン履歴はプラン機能（Freeでは保存しない）
    if (limits.versionHistory) {
      const versionUserId = cookieUserId ?? currentDoc.user_id;
      await supabase.from("document_versions").insert({
        document_id: currentDoc.id,
        user_id: versionUserId,
        title: currentDoc.title,
        category: currentDoc.category,
        raw_content: currentDoc.raw_content,
        summary: currentDoc.summary,
        tags: currentDoc.tags,
      });
    }
  } catch (e) {
    // バージョン保存に失敗しても本体更新は続行する
    console.error("Failed to insert document_versions:", e);
  }

  // AI は best-effort:
  // - 予算超過 / OpenAI障害があっても「編集保存」自体は継続し、AI要約/タグ/埋め込みだけスキップする
  const orgId = currentDoc.organization_id ?? null;
  const aiEnabled = Boolean(process.env.OPENAI_API_KEY);
  let canUseAi = false;
  let aiDetails: string | null = null;
  let nextSummary: string | undefined;
  let nextTags: string[] | undefined;

  if (aiEnabled) {
    try {
      // summary+tags + embedding
      await ensureAndConsumeAICalls(cookieUserId, orgId, 2, locale);
      canUseAi = true;
    } catch (e) {
      console.error("[updateDocument] AI budget/rate limit hit:", e);
      aiDetails = "ai_skipped_budget_or_rate_limit";
    }
  } else {
    aiDetails = "ai_skipped_disabled";
  }

  if (canUseAi) {
    try {
      const generated = await generateSummaryAndTags(rawContent);
      nextSummary = generated.summary;
      nextTags = generated.tags;
    } catch (e) {
      console.error("[updateDocument] AI generate failed:", e);
      aiDetails = "ai_skipped_generation_failed";
      canUseAi = false;
    }
  }

  type DocumentUpdate = {
    title: string;
    category: string;
    raw_content: string;
    summary?: string;
    tags?: string[];
  };

  const updatePayload: DocumentUpdate = {
    title,
    category: category || (locale === "en" ? "Uncategorized" : "未分類"),
    raw_content: rawContent,
  };
  if (nextSummary !== undefined && nextTags !== undefined) {
    updatePayload.summary = nextSummary;
    updatePayload.tags = nextTags;
  }

  const { error } = await supabase
    .from("documents")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", cookieUserId);

  if (error) {
    console.error(error);
    throw new Error(
      locale === "en"
        ? "Failed to update the document."
        : "ドキュメントの更新に失敗しました。",
    );
  }

  await logActivity("update_document", {
    documentId: id,
    documentTitle: title,
    details: aiDetails ?? undefined,
  });

  // 本文が変わったら埋め込みも更新（AIが有効かつ予算OKの場合のみ）
  if (aiEnabled && canUseAi) {
    updateDocumentEmbedding(id, rawContent, cookieUserId).catch(console.error);
  }

  redirect(locale === "en" ? `/documents/${id}?lang=en` : `/documents/${id}`);
}

export default async function EditDocumentPage({ params, searchParams }: PageProps) {
  const { id } = params;
  const sp = searchParams ? await searchParams : undefined;
  const locale: Locale = getLocaleFromParam(sp?.lang);
  const withLang = (href: string) => {
    if (locale !== "en") return href;
    if (href.includes("lang=en")) return href;
    if (href.includes("?")) return `${href}&lang=en`;
    return `${href}?lang=en`;
  };

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  if (!userId) {
    const loginPath = locale === "en" ? "/en/auth/login" : "/auth/login";
    redirect(
      `${loginPath}?redirectTo=${encodeURIComponent(
        withLang(`/documents/${id}/edit`),
      )}`,
    );
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error(error);
    redirect(withLang("/app"));
  }

  const doc = data as {
    id: string;
    title: string;
    category: string | null;
    raw_content: string | null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              DocuFlow
            </h1>
            <p className="text-sm text-slate-500">
              {locale === "en" ? "Edit document" : "ドキュメント編集"}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <a
              href={withLang(`/documents/${id}`)}
              className="font-medium text-slate-600 underline-offset-4 hover:underline"
            >
              {locale === "en" ? "Back" : "戻る"}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            {locale === "en" ? "Edit document details" : "ドキュメント情報を編集"}
          </h2>
          <form action={updateDocument} className="space-y-4">
            <input type="hidden" name="lang" value={locale} />
            <input type="hidden" name="id" value={doc.id} />

            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                {locale === "en" ? "Title" : "タイトル"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                required
                defaultValue={doc.title}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:bg-white focus:ring"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                {locale === "en" ? "Category" : "カテゴリ"}
              </label>
              <input
                id="category"
                name="category"
                defaultValue={doc.category ?? ""}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:bg-white focus:ring"
              />
            </div>

            <div>
              <label
                htmlFor="rawContent"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                {locale === "en" ? "Content" : "本文"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <p className="mb-2 text-xs text-slate-500">
                {locale === "en"
                  ? "If AI is available, a new summary and tags will be generated from the updated content."
                  : "AIが利用可能な場合、編集後の本文をもとに要約とタグを再生成します。"}
              </p>
              <textarea
                id="rawContent"
                name="rawContent"
                required
                rows={12}
                defaultValue={doc.raw_content ?? ""}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:bg-white focus:ring"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                {locale === "en"
                  ? "Saving may also update the AI summary and tags (best-effort)."
                  : "保存時にAI要約とタグも更新されます（best-effort）。"}
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
              >
                {locale === "en"
                  ? "Update"
                  : "更新"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
