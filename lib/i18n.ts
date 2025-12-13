// 言語切り替え廃止: 日本語のみ対応
// 型は互換性のため "ja" | "en" を維持するが、実際には常に日本語を返す
export type Locale = "ja" | "en";

// 日本語のみの翻訳辞書
const translations = {
  // Auth
  login: "ログイン",
  signup: "アカウント作成",
  logout: "ログアウト",
  // Dashboard / app
  dashboard: "ダッシュボード",
  whatsNew: "What's New",
  allDocuments: "すべて",
  favorites: "お気に入り",
  pinned: "ピン留め",
  archived: "アーカイブ",
  newDocument: "新規作成",
  settings: "設定",
  totalDocuments: "ドキュメント総数",
  last30Days: "直近30日",
  total: "合計",
  pins: "ピン",
  favs: "お気に入り",
  docs: "件",
  searchPlaceholder: "タイトル・要約・タグで検索...",
  similarSearch: "類似検索",
  filterAll: "すべて",
  filterRecent: "最近追加",
  filterFavorites: "お気に入り",
  filterPinned: "ピン留め",
  filterArchived: "アーカイブ済み",
  noSummary: "（要約なし）",
  viewDetails: "詳細を見る",
  noDocuments: "ドキュメントがありません",
  noDocumentsDesc:
    "新しいドキュメントを作成するか、PDF / Word ファイルをアップロードしてください。",
  createFirst: "最初のドキュメントを作成",
  delete: "削除",
  archive: "アーカイブ",
  unarchive: "アーカイブ解除",
  statusOk: "稼働中",
  recentActive: "最近アクティブなドキュメント数",
  // Common dialog labels
  confirm: "確認",
  cancel: "キャンセル",
} as const;

export type TranslationKey = keyof typeof translations;

export function t(_locale: Locale, key: TranslationKey): string {
  return translations[key] ?? key;
}

export function getLocaleFromParam(_lang?: string): Locale {
  // 常に日本語を返す（英語版は別サイトで提供）
  return "ja";
}
