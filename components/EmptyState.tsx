import Link from "next/link";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
};

export function EmptyState({
  icon = "📄",
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
}: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in-up">
      {/* Icon */}
      <div className="empty-state-icon animate-float">
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {actionLabel && actionHref && (
            <Link href={actionHref} className="btn btn-primary">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>{actionLabel}</span>
            </Link>
          )}
          {secondaryActionLabel && secondaryActionHref && (
            <Link href={secondaryActionHref} className="btn btn-secondary">
              <span>{secondaryActionLabel}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states
export function NoDocumentsEmptyState() {
  return (
    <EmptyState
      icon="📝"
      title="ドキュメントがありません"
      description="最初のドキュメントを作成して、AIによる自動要約とタグ付けを体験しましょう。"
      actionLabel="最初のドキュメントを作成"
      actionHref="/new"
    />
  );
}

export function NoSearchResultsEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon="🔍"
      title="検索結果がありません"
      description={`「${query}」に一致するドキュメントが見つかりませんでした。別のキーワードで検索してみてください。`}
      actionLabel="すべてのドキュメントを表示"
      actionHref="/app"
    />
  );
}

export function NoFavoritesEmptyState() {
  return (
    <EmptyState
      icon="⭐"
      title="お気に入りがありません"
      description="よく使うドキュメントをお気に入りに追加すると、ここに表示されます。"
      actionLabel="ドキュメント一覧へ"
      actionHref="/app"
    />
  );
}

export function NoArchivedEmptyState() {
  return (
    <EmptyState
      icon="📦"
      title="アーカイブが空です"
      description="アーカイブされたドキュメントはありません。不要なドキュメントをアーカイブして整理しましょう。"
      actionLabel="ドキュメント一覧へ"
      actionHref="/app"
    />
  );
}

