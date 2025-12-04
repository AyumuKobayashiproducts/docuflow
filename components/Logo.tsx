import Link from "next/link";

type LogoProps = {
  withTagline?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function Logo({ withTagline = false, className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: {
      container: "h-7 w-7",
      text: "text-[9px]",
      title: "text-xs",
      tagline: "text-[10px]",
      dot: "h-1.5 w-1.5 -right-0.5 -top-0.5",
    },
    md: {
      container: "h-9 w-9",
      text: "text-[11px]",
      title: "text-sm",
      tagline: "text-[11px]",
      dot: "h-2 w-2 -right-1 -top-1",
    },
    lg: {
      container: "h-12 w-12",
      text: "text-sm",
      title: "text-lg",
      tagline: "text-xs",
      dot: "h-2.5 w-2.5 -right-1 -top-1",
    },
  };

  const s = sizes[size];

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 text-slate-900 ${className}`}
    >
      <div className={`relative flex ${s.container} items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-indigo-500 ${s.text} font-bold text-white shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105`}>
        <span className="tracking-tight drop-shadow-sm">DF</span>
        {/* Animated dot */}
        <span className={`pointer-events-none absolute ${s.dot} rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-125`}>
          <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
        </span>
        {/* Glow effect on hover */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-emerald-500/50 via-sky-500/50 to-indigo-500/50 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-60" />
      </div>
      <div className="leading-tight">
        <p className={`${s.title} font-semibold tracking-tight transition-colors duration-200 group-hover:text-emerald-600`}>
          DocuFlow
        </p>
        {withTagline && (
          <p className={`${s.tagline} text-slate-500 transition-colors duration-200 group-hover:text-slate-600`}>
            AI 要約で、PDF / Word 資料を一瞬で整理
          </p>
        )}
      </div>
    </Link>
  );
}

// Standalone icon version for favicon or compact displays
export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-indigo-500 text-[11px] font-bold text-white shadow-md ${className}`}>
      <span className="tracking-tight drop-shadow-sm">DF</span>
      <span className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white shadow-sm" />
    </div>
  );
}
