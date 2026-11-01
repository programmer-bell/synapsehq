import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/src/shared/lib/cn";

export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "outline" | "destructive" | "success";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-indigo-500/30 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-[0_8px_24px_-10px_rgba(79,70,229,0.9)] hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 hover:shadow-[0_12px_30px_-10px_rgba(124,58,237,0.8)]",
  secondary:
    "border border-border bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  ghost:
    "border border-transparent text-muted-foreground hover:bg-accent/10 hover:text-accent",
  outline:
    "border border-border bg-card text-foreground shadow-sm hover:border-accent/40 hover:bg-accent/5 hover:text-accent",
  destructive:
    "border border-rose-500/30 bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_8px_24px_-12px_rgba(225,29,72,0.9)] hover:from-rose-500 hover:to-red-500",
  success:
    "border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_8px_24px_-12px_rgba(5,150,105,0.9)] hover:from-emerald-500 hover:to-teal-500",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-2.5 text-xs",
  md: "h-9 gap-2 rounded-lg px-3.5 text-sm",
  lg: "h-11 gap-2 rounded-xl px-5 text-sm",
  icon: "size-9 rounded-lg",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex select-none items-center justify-center font-medium outline-none transition-all duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        {children}
      </button>
    );
  },
);
