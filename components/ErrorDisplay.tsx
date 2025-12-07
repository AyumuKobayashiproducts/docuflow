import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

type ErrorDisplayProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
};

export function ErrorDisplay({
  title,
  message,
  onRetry,
  showRetry = true,
}: ErrorDisplayProps) {
  const locale: Locale = useLocale();
  const effectiveTitle =
    title ??
    (locale === "en"
      ? "An error has occurred"
      : "エラーが発生しました");
  const effectiveMessage =
    message ??
    (locale === "en"
      ? "Sorry, something went wrong. Please try again."
      : "申し訳ございません。問題が発生しました。もう一度お試しください。");

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
          😞
        </div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          {effectiveTitle}
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          {effectiveMessage}
        </p>
        {showRetry && onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{locale === "en" ? "Retry" : "再試行"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundaryFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const locale: Locale = useLocale();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="card p-8 max-w-2xl w-full">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl mx-auto">
          ⚠️
        </div>
        <h1 className="mb-3 text-center text-xl font-bold text-slate-900">
          {locale === "en"
            ? "An unexpected error has occurred"
            : "予期しないエラーが発生しました"}
        </h1>
        <p className="mb-4 text-center text-sm text-slate-600">
          {locale === "en"
            ? "Sorry, something went wrong in the application."
            : "申し訳ございません。アプリケーションでエラーが発生しました。"}
        </p>
        <details className="mb-6 rounded-lg bg-slate-50 p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            {locale === "en" ? "Error details" : "エラー詳細"}
          </summary>
          <pre className="mt-3 overflow-auto text-xs text-slate-600">
            {error.message}
          </pre>
        </details>
        <div className="flex justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{locale === "en" ? "Retry" : "再試行"}</span>
          </button>
          <a href="/app" className="btn btn-secondary">
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>
              {locale === "en" ? "Back to home" : "ホームに戻る"}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}




