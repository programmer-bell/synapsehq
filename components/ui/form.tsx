import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/src/shared/lib/cn";

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60";

export const selectClass = `${inputClass} cursor-pointer`;

export const labelClass = "block text-xs font-semibold text-foreground";

export const fieldErrorClass =
  "text-xs font-medium text-rose-600 dark:text-rose-400";

export function FormAlert({
  status,
  message,
}: {
  status: "idle" | "error" | "success";
  message?: string;
}) {
  if (!message) return null;
  const isError = status === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <p
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs font-medium leading-5",
        isError
          ? "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300"
          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      {message}
    </p>
  );
}

export function RequiredHint({ children }: { children: ReactNode }) {
  return (
    <span className="ml-1 text-[10px] font-normal text-muted-foreground">
      {children}
    </span>
  );
}
