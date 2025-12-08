"use client";

import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: "default" | "highlight" | "gradient";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className = "",
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-3.5 w-3.5" />;
    if (trend.value < 0) return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (trend.value < 0) return "text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400";
    return "text-slate-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-400";
  };

  const variantStyles = {
    default: "bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800",
    highlight: "bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200/50 dark:from-emerald-900/20 dark:to-sky-900/20 dark:border-emerald-800/50",
    gradient: "bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0",
  };

  return (
    <div className={`relative rounded-xl p-5 transition-all duration-200 hover:shadow-lg ${variantStyles[variant]} ${className}`}>
      {/* Top accent line for highlight variant */}
      {variant === "highlight" && (
        <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full" />
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={`text-xs font-medium ${variant === "gradient" ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold tracking-tight ${variant === "gradient" ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>
              {value}
            </p>
            {trend && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md ${getTrendColor()}`}>
                {getTrendIcon()}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs ${variant === "gradient" ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
            variant === "gradient" 
              ? "bg-white/10 text-white" 
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          }`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

