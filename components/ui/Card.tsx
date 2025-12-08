import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const variantStyles = {
  default: "bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800",
  elevated: "bg-white shadow-lg shadow-slate-200/50 dark:bg-slate-900 dark:shadow-slate-900/50",
  bordered: "bg-white border-2 border-slate-200 dark:bg-slate-900 dark:border-slate-700",
  ghost: "bg-slate-50/50 dark:bg-slate-800/50",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", hover = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl transition-all duration-200 ${variantStyles[variant]} ${paddingStyles[padding]} ${hover ? "hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer" : ""} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 ${className}`} {...props}>{children}</div>
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", children, ...props }, ref) => (
    <h3 ref={ref} className={`text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight ${className}`} {...props}>{children}</h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", children, ...props }, ref) => (
    <p ref={ref} className={`text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props}>{children}</p>
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>{children}</div>
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`flex items-center pt-4 ${className}`} {...props}>{children}</div>
  )
);
CardFooter.displayName = "CardFooter";

