import Link from "next/link";

import { PageShell } from "@/src/shared/components/layout/page-shell";

export default function Home() {
  return (
    <PageShell>
      <div className="w-full max-w-2xl">
        <p className="text-sm font-medium tracking-tight text-accent">
          SynapseHQ
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Engineering workspace foundation
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Projects, tasks, and team collaboration will live here. Create an
          account to access your secure workspace.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
          >
            Sign in
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
