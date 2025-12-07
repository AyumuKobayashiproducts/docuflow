// Simple i18n dictionary for dashboard

export type Locale = "ja" | "en";

const translations = {
  ja: {
    // Header
    dashboard: "ダッシュボード",
    whatsNew: "What's New",
    // Sidebar
    allDocuments: "すべて",
    favorites: "お気に入り",
    pinned: "ピン留め",
    archived: "アーカイブ",
    newDocument: "新規作成",
    settings: "設定",
    // Stats
    totalDocuments: "ドキュメント総数",
    last30Days: "直近30日",
    total: "合計",
    pins: "ピン",
    favs: "お気に入り",
    docs: "件",
    // Search
    searchPlaceholder: "タイトル・要約・タグで検索...",
    similarSearch: "類似検索",
    // Filters
    filterAll: "すべて",
    filterRecent: "最近追加",
    filterFavorites: "お気に入り",
    filterPinned: "ピン留め",
    filterArchived: "アーカイブ済み",
    // Document card
    noSummary: "（要約なし）",
    viewDetails: "詳細を見る",
    // Empty state
    noDocuments: "ドキュメントがありません",
    noDocumentsDesc: "新しいドキュメントを作成するか、PDF / Word ファイルをアップロードしてください。",
    createFirst: "最初のドキュメントを作成",
    // Actions
    delete: "削除",
    archive: "アーカイブ",
    unarchive: "アーカイブ解除",
    // Status
    statusOk: "稼働中",
    recentActive: "最近アクティブなドキュメント数",
  },
  en: {
    // Header
    dashboard: "Dashboard",
    whatsNew: "What's New",
    // Sidebar
    allDocuments: "All",
    favorites: "Favorites",
    pinned: "Pinned",
    archived: "Archived",
    newDocument: "New Document",
    settings: "Settings",
    // Stats
    totalDocuments: "Total Documents",
    last30Days: "Last 30 Days",
    total: "Total",
    pins: "Pinned",
    favs: "Favorites",
    docs: "",
    // Search
    searchPlaceholder: "Search by title, summary, or tags...",
    similarSearch: "Similar Search",
    // Filters
    filterAll: "All",
    filterRecent: "Recent",
    filterFavorites: "Favorites",
    filterPinned: "Pinned",
    filterArchived: "Archived",
    // Document card
    noSummary: "(No summary)",
    viewDetails: "View Details",
    // Empty state
    noDocuments: "No documents yet",
    noDocumentsDesc: "Create a new document or upload a PDF / Word file to get started.",
    createFirst: "Create Your First Document",
    // Actions
    delete: "Delete",
    archive: "Archive",
    unarchive: "Unarchive",
    // Status
    statusOk: "Operational",
    recentActive: "Recently Active Documents",
  },
} as const;

export function t(locale: Locale, key: keyof typeof translations.ja): string {
  return translations[locale][key] ?? translations.ja[key] ?? key;
}

export function getLocaleFromParam(lang: string | undefined): Locale {
  return lang === "en" ? "en" : "ja";
}

