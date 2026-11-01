import type { HTMLAttributes } from "react";

import { cn } from "@/src/shared/lib/cn";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "violet"
  | "slate";

const variants: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary/12 text-primary",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "border-border bg-card text-muted-foreground",
  info: "border-sky-500/20 bg-sky-500/12 text-sky-700 dark:text-sky-300",
  success:
    "border-emerald-500/20 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  warning:
    "border-amber-500/25 bg-amber-500/12 text-amber-700 dark:text-amber-300",
  danger: "border-rose-500/25 bg-rose-500/12 text-rose-700 dark:text-rose-300",
  violet:
    "border-violet-500/20 bg-violet-500/12 text-violet-700 dark:text-violet-300",
  slate:
    "border-slate-500/15 bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  dot?: boolean;
};

export function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5",
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]"
        />
      ) : null}
      {children}
    </span>
  );
}

export function statusVariant(
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
): BadgeVariant {
  switch (status) {
    case "DONE":
      return "success";
    case "IN_PROGRESS":
      return "warning";
    case "IN_REVIEW":
      return "violet";
    default:
      return "slate";
  }
}

export function priorityVariant(
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
): BadgeVariant {
  switch (priority) {
    case "URGENT":
      return "danger";
    case "HIGH":
      return "warning";
    case "MEDIUM":
      return "info";
    default:
      return "slate";
  }
}
