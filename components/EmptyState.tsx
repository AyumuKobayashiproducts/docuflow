import Link from "next/link";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = "📭",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 max-w-md">{description}</p>
      {(actionLabel && (actionHref || onAction)) && (
        <div>
          {actionHref ? (
            <Link href={actionHref} className="btn btn-primary">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn btn-primary">
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
