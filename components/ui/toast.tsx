"use client";

import {
  CheckCircle2,
  Info,
  Sparkles,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { cn } from "@/src/shared/lib/cn";

export type ToastVariant = "default" | "success" | "info" | "warning" | "error";

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
};

const noop = () => {};

const ToastContext = createContext<ToastContextValue>({
  toast: noop,
  dismiss: noop,
});

export function useToast() {
  return useContext(ToastContext);
}

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border bg-card text-card-foreground",
  success: "border-emerald-500/30 bg-card text-card-foreground",
  info: "border-sky-500/30 bg-card text-card-foreground",
  warning: "border-amber-500/30 bg-card text-card-foreground",
  error: "border-rose-500/30 bg-card text-card-foreground",
};

const iconStyles: Record<ToastVariant, string> = {
  default: "bg-primary/12 text-primary",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  info: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  error: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const className = "size-4";
  switch (variant) {
    case "success":
      return <CheckCircle2 aria-hidden="true" className={className} />;
    case "info":
      return <Info aria-hidden="true" className={className} />;
    case "warning":
      return <TriangleAlert aria-hidden="true" className={className} />;
    case "error":
      return <XCircle aria-hidden="true" className={className} />;
    default:
      return <Sparkles aria-hidden="true" className={className} />;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      counter.current += 1;
      const id = `toast-${Date.now()}-${counter.current}`;
      const item: ToastItem = {
        ...options,
        id,
        variant: options.variant ?? "default",
      };
      setToasts((current) => [...current.slice(-3), item]);
      const timer = setTimeout(
        () => dismiss(id),
        options.duration ?? (options.variant === "error" ? 6000 : 4200),
      );
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map((item) => {
          const variant = item.variant ?? "default";
          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm animate-slide-in-right items-start gap-3 rounded-xl border p-3.5 shadow-xl shadow-slate-950/10 backdrop-blur",
                variantStyles[variant],
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  iconStyles[variant],
                )}
              >
                <ToastIcon variant={variant} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold leading-5 text-foreground">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
