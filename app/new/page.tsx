import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import {
  generateSummaryAndTags,
  generateTitleFromContent,
  generateCategoryFromContent,
} from "@/lib/ai";
import { logActivity } from "@/lib/activityLog";
import { updateDocumentEmbedding } from "@/lib/similarSearch";
import { getActiveOrganizationId } from "@/lib/organizations";
import { canCreateDocument } from "@/lib/subscription";
import { canUseStorage } from "@/lib/subscriptionUsage";
import { ensureAndConsumeAICalls } from "@/lib/aiUsage";
import { Logo } from "@/components/Logo";
import { NewSubmitButtons } from "@/components/NewSubmitButtons";
import { NewFileDropZone } from "@/components/NewFileDropZone";
import { getLocaleFromParam, type Locale } from "@/lib/i18n";

// 検索クエリ () によって内容が変わるため、静的生成ではなく毎回評価する
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const BYTES_PER_MB = 1024 * 1024;

async function extractTextFromFile(file: File, locale: Locale): Promise<string> {
  const filename = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (filename.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return (data.text ?? "").trim();
  }

  if (filename.endsWith(".doc") || filename.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return (result.value ?? "").trim();
  }

  throw new Error(
    locale === "en"
      ? "Unsupported file format. Only PDF / DOC / DOCX are supported."
      : "サポートされていないファイル形式です。PDF / DOC / DOCX のみ対応しています。",
  );
}

// AI を使わず「とりあえず保存」する高速パス
async function fastCreateDocument(formData: FormData) {
  "use server";

  const locale: Locale = getLocaleFromParam(String(formData.get("lang") ?? ""));
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  const activeOrgId = userId ? await getActiveOrganizationId(userId) : null;

  let title = String(formData.get("title") ?? "").trim();
  let category = String(formData.get("category") ?? "").trim();
  const rawContent = String(formData.get("rawContent") ?? "").trim();
  const file = formData.get("file");

  let content = rawContent;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.error(
        locale === "en"
          ? "Uploaded file is too large (max 10MB)."
          : "アップロードされたファイルが大きすぎます（最大 10MB まで）。",
      );
      return;
    }

    try {
      content = await extractTextFromFile(file, locale);
    } catch (e) {
      console.error(
        locale === "en"
          ? "Failed to extract text from the file:"
          : "ファイルからテキストを抽出できませんでした:",
        e,
      );
      return;
    }
  }

  if (!content) {
    return;
  }

  // プラン制限チェック
  const limitCheck = await canCreateDocument(userId, activeOrgId, locale);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.reason || "Document limit reached");
  }

  // ストレージ容量チェック（実際に保存する本文のサイズで判定）
  const contentSizeMB = new Blob([content]).size / BYTES_PER_MB;
  const storageCheck = await canUseStorage(
    userId,
    activeOrgId,
    contentSizeMB,
    locale,
  );
  if (!storageCheck.allowed) {
    throw new Error(storageCheck.reason || "Storage limit exceeded");
  }

  if (!title) {
    title = content.slice(0, 30) || (locale === "en" ? "Untitled document" : "無題ドキュメント");
  }
  if (!category) {
    category = locale === "en" ? "Uncategorized" : "未分類";
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      organization_id: activeOrgId,
      title,
      category,
      raw_content: content,
      summary: null,
      tags: [],
      is_favorite: false,
      is_pinned: false,
    })
    .select("id");

  if (error) {
    console.error("Supabase insert error (fastCreateDocument):", error);
    throw new Error(`Failed to insert document: ${error.message}`);
  }

  const created = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (created?.id) {
    await logActivity("create_document", {
      documentId: String(created.id),
      documentTitle: title,
    });
    // NOTE:
    // 高速保存は「AIを使わずに保存」するパス。
    // 埋め込み生成（OpenAI呼び出し）はAI使用量の抜け道になり得るため、ここでは実行しない。
  }

  redirect(locale === "en" ? "/app?lang=en" : "/app");
}

async function createDocument(formData: FormData) {
  "use server";

  const locale: Locale = getLocaleFromParam(String(formData.get("lang") ?? ""));
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  const activeOrgId = userId ? await getActiveOrganizationId(userId) : null;

  let title = String(formData.get("title") ?? "").trim();
  let category = String(formData.get("category") ?? "").trim();
  const rawContent = String(formData.get("rawContent") ?? "").trim();
  const file = formData.get("file");

  let content = rawContent;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.error(
        locale === "en"
          ? "Uploaded file is too large (max 10MB)."
          : "アップロードされたファイルが大きすぎます（最大 10MB まで）。",
      );
      return;
    }

    try {
      content = await extractTextFromFile(file, locale);
    } catch (e) {
      console.error(
        locale === "en"
          ? "Failed to extract text from the file:"
          : "ファイルからテキストを抽出できませんでした:",
        e,
      );
      return;
    }
  }

  if (!content) {
    return;
  }

  // プラン制限チェック
  const limitCheck = await canCreateDocument(userId, activeOrgId, locale);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.reason || "Document limit reached");
  }

  // ストレージ容量チェック（ファイルアップロード時）
  // ※ファイルサイズではなく「保存する本文（抽出後のテキスト）」で判定して抜け道をなくす
  const contentSizeMB = new Blob([content]).size / BYTES_PER_MB;
  const storageCheck = await canUseStorage(userId, activeOrgId, contentSizeMB, locale);
  if (!storageCheck.allowed) {
    throw new Error(storageCheck.reason || "Storage limit exceeded");
  }

  let summary = "";
  let tags: string[] = [];

  try {
    // OpenAI が有効な場合のみ、AI予算（回数）を事前に消費して上限を強制する
    if (process.env.OPENAI_API_KEY) {
      const aiCallsNeeded =
        (title ? 0 : 1) + // title
        (category ? 0 : 1) + // category
        1 + // summary & tags
        1; // embedding (background)
      await ensureAndConsumeAICalls(userId, activeOrgId, aiCallsNeeded, locale);
    }

    const titlePromise = title
      ? Promise.resolve(title)
      : generateTitleFromContent(content);
    const categoryPromise = category
      ? Promise.resolve(category)
      : generateCategoryFromContent(content);
    const summaryPromise = generateSummaryAndTags(content);

    const [generatedTitle, generatedCategory, generated] = await Promise.all([
      titlePromise,
      categoryPromise,
      summaryPromise,
    ]);

    title =
      (generatedTitle || title || content.slice(0, 30)) ||
      (locale === "en" ? "Untitled document" : "無題ドキュメント");
    category =
      (generatedCategory ||
        category ||
        (locale === "en" ? "Uncategorized" : "未分類")) ||
      (locale === "en" ? "Uncategorized" : "未分類");
    summary = generated.summary;
    tags = generated.tags;
  } catch (e) {
    console.error("AI generate error in createDocument:", e);
    if (!title) {
      title = content.slice(0, 30) || (locale === "en" ? "Untitled document" : "無題ドキュメント");
    }
    if (!category) {
      category = locale === "en" ? "Uncategorized" : "未分類";
    }
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      organization_id: activeOrgId,
      title,
      category: category || (locale === "en" ? "Uncategorized" : "未分類"),
      raw_content: content,
      summary,
      tags,
      is_favorite: false,
      is_pinned: false,
    })
    .select("id");

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(`Failed to insert document: ${error.message}`);
  }

  const created = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (created?.id) {
    await logActivity("create_document", {
      documentId: String(created.id),
      documentTitle: title,
    });

    // 埋め込みベクトルを生成・保存（AI処理と並行して実行）
    updateDocumentEmbedding(String(created.id), content, userId).catch(console.error);
  }

  redirect(locale === "en" ? "/app?lang=en" : "/app");
}
type NewPageProps = {
  searchParams?:
    | {
        lang?: string;
      }
    | Promise<{
        lang?: string;
      }>;
};

export default async function NewDocumentPage({ searchParams }: NewPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const locale: Locale = getLocaleFromParam(params?.lang);
  const withLang = (href: string) => {
    if (locale !== "en") return href;
    if (href.includes("lang=en")) return href;
    if (href.includes("?")) return `${href}&lang=en`;
    return `${href}?lang=en`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-pattern opacity-30 pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-sky-100/40 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="glass border-b border-slate-200/50 sticky top-0 z-50">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Logo
              withTagline
              tagline={
                locale === "en"
                  ? "Create a document and try AI summaries"
                  : "新しいドキュメントを作成して AI 要約を試す"
              }
            />
            <nav className="flex items-center gap-3">
              <Link
                href={withLang("/app")}
                className="btn btn-secondary text-xs"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>
                  {locale === "en" ? "Back to list" : "一覧に戻る"}
                </span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">
          {/* Page Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900">
              {locale === "en" ? "New document" : "新規ドキュメント"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {locale === "en"
                ? "Create a document by typing text or uploading a PDF / Word file."
                : "テキストを入力するか、PDF / Word ファイルをアップロードしてドキュメントを作成"}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Main Form */}
            <div className="card p-6 lg:p-8 animate-fade-in-up">
              <form className="space-y-6" action={createDocument}>
                <input type="hidden" name="lang" value={locale} />
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-xs">
                      📝
                    </span>
                    {locale === "en" ? "Title" : "タイトル"}
                    <span className="text-xs font-normal text-slate-400">
                      {locale === "en"
                        ? "(Optional — AI can generate)"
                        : "（空欄ならAIが自動生成）"}
                    </span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    placeholder={
                      locale === "en"
                        ? "e.g. Product requirements"
                        : "例: プロダクト要件定義書"
                    }
                    className="input"
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-xs">
                      🏷️
                    </span>
                    {locale === "en" ? "Category" : "カテゴリ"}
                    <span className="text-xs font-normal text-slate-400">
                      {locale === "en"
                        ? "(Optional — AI can infer)"
                        : "（空欄ならAIが自動判定）"}
                    </span>
                  </label>
                  <input
                    id="category"
                    name="category"
                    placeholder={
                      locale === "en"
                        ? "e.g. Spec / Meeting notes / Proposal"
                        : "例: 仕様書 / 議事録 / 企画書"
                    }
                    className="input"
                  />
                </div>

                {/* Content */}
                <div>
                  <label
                    htmlFor="rawContent"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-xs">
                      📄
                    </span>
                    {locale === "en" ? "Content" : "本文"}
                  </label>
                  <p className="mb-3 text-xs text-slate-500">
                    {locale === "en"
                      ? "DocuFlow can generate a summary and up to 3 tags from this content. If you upload a file, extracted text will be saved automatically."
                      : "この本文をもとにAIが要約とタグ（最大3つ）を自動生成します。ファイルをアップロードした場合は、抽出されたテキストが自動で保存されます。"}
                  </p>
                  <textarea
                    id="rawContent"
                    name="rawContent"
                    rows={14}
                    placeholder={
                      locale === "en"
                        ? "Paste or type your document content..."
                        : "ドキュメントの本文を入力またはペーストしてください..."
                    }
                    className="input resize-none font-mono text-sm"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-xs">
                      📁
                    </span>
                    {locale === "en" ? "File upload" : "ファイルアップロード"}
                  </label>
                  <p className="mb-3 text-xs text-slate-500">
                    {locale === "en"
                      ? "Supports PDF / Word (.doc, .docx). Max 10MB."
                      : "PDF / Word（.doc, .docx）に対応。最大10MBまで。"}
                  </p>
                  <input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  <NewFileDropZone inputId="file" />
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                      {locale === "en"
                        ? "Tip: AI summary may take a few seconds. Use “Save without AI” if you’re in a hurry."
                        : "💡 AI要約ありは処理に数秒かかります。急ぎの場合は「高速保存」をお使いください。"}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        type="reset"
                        className="btn btn-secondary text-xs"
                      >
                        {locale === "en" ? "Clear" : "クリア"}
                      </button>
                      <NewSubmitButtons
                        fastAction={fastCreateDocument}
                        aiAction={createDocument}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4 animate-fade-in stagger-3">
              {/* About Card */}
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 text-sm text-white">
                    ✨
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {locale === "en" ? "About AI features" : "AI機能について"}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {locale === "en"
                    ? "DocuFlow uses GPT to generate summaries, tags, and titles. It’s designed to turn documents into searchable knowledge."
                    : "DocuFlowは GPT-4 を活用して、ドキュメントの要約・タグ付け・タイトル生成を自動で行います。日本語の業務ドキュメントに最適化されています。"}
                </p>
              </div>

              {/* Process Steps */}
              <div className="card p-5">
                <h3 className="font-semibold text-slate-900 mb-4">
                  {locale === "en" ? "How it works" : "処理の流れ"}
                </h3>
                <ol className="space-y-3">
                  {[
                    {
                      icon: "1️⃣",
                      text:
                        (locale === "en"
                          ? "Type text or upload a file"
                          : "テキスト入力 or ファイルアップロード"),
                    },
                    {
                      icon: "2️⃣",
                      text:
                        (locale === "en"
                          ? "AI generates a summary"
                          : "AIが本文を解析して要約を生成"),
                    },
                    {
                      icon: "3️⃣",
                      text:
                        (locale === "en"
                          ? "AI extracts up to 3 tags"
                          : "関連タグ（最大3つ）を自動抽出"),
                    },
                    {
                      icon: "4️⃣",
                      text:
                        (locale === "en"
                          ? "Saved and shown on your dashboard"
                          : "データベースに保存して一覧に反映"),
                    },
                  ].map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-xs text-slate-600"
                    >
                      <span className="text-base">{step.icon}</span>
                      <span>{step.text}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips Card */}
              <div className="card p-5 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span>💡</span>
                  {locale === "en" ? "Tips" : "おすすめの使い方"}
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>
                      {locale === "en"
                        ? "Upload long PDFs and skim key points fast"
                        : "長いPDF資料をアップロードして要点だけを素早く把握"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>
                      {locale === "en"
                        ? "Paste meeting notes and get searchable tags"
                        : "会議の議事録を貼り付けて検索しやすいタグを自動付与"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>
                      {locale === "en"
                        ? "Organize internal knowledge by category"
                        : "社内ナレッジをカテゴリごとに整理してストック"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Supported Formats */}
              <div className="card p-5">
                <h3 className="font-semibold text-slate-900 mb-3">
                  {locale === "en" ? "Supported formats" : "対応フォーマット"}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { ext: "PDF", color: "bg-red-50 text-red-600" },
                    { ext: "DOC", color: "bg-blue-50 text-blue-600" },
                    { ext: "DOCX", color: "bg-blue-50 text-blue-600" },
                  ].map((format) => (
                    <div
                      key={format.ext}
                      className={`rounded-lg px-3 py-2 text-center text-xs font-medium ${format.color}`}
                    >
                      .{format.ext.toLowerCase()}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                  {locale === "en" ? "Max file size: 10MB" : "最大ファイルサイズ: 10MB"}
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
