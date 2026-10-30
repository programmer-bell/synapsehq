import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAction } from "@/src/modules/auth/actions/logout";
import { requireUser } from "@/src/modules/auth/services/session-service";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              SynapseHQ
            </Link>
            <nav aria-label="Primary">
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        {children}
      </main>
    </div>
  );
}
