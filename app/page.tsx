import Link from "next/link";
import Image from "next/image";

import { PageShell } from "@/src/shared/components/layout/page-shell";

export default function Home() {
  return (
    <PageShell>
      <div className="w-full max-w-5xl">
        <div className="grid items-center gap-8 rounded-lg border border-border bg-surface p-6 sm:p-10 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
              SynapseHQ · Team workspace
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              A clearer view of your team&apos;s work.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Keep projects organized, move tasks through your workflow, and
              give your team a dependable place to collaborate.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href="/signup"
                className="inline-flex h-9 items-center rounded-md bg-accent px-3.5 text-sm font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent/90"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-md border border-border px-3.5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface-muted"
              >
                Sign in
              </Link>
            </div>
          </div>
          <Image
            src="/logo.png"
            alt="SynapseHQ"
            width={180}
            height={180}
            priority
            className="mx-auto size-36 rounded-md object-cover md:size-44"
          />
        </div>
      </div>
    </PageShell>
  );
}
