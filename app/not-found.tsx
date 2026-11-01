import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { PageShell } from "@/src/shared/components/layout/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 text-accent">
          <Compass aria-hidden="true" className="size-5" />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          404
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:text-accent active:scale-[0.98]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Return home
        </Link>
      </div>
    </PageShell>
  );
}
