import type { ReactNode } from "react";
import { Suspense } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { requireUser } from "@/src/modules/auth/services/session-service";
import { listProjectsForWorkspace } from "@/src/modules/projects/services/project-service";
import { listWorkspacesForUserWithSummary } from "@/src/modules/workspaces/services/workspace-service";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardShellFallback />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}

async function DashboardShell({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const workspaces = await listWorkspacesForUserWithSummary(user.id);
  const projectGroups = await Promise.all(
    workspaces.map((workspace) =>
      listProjectsForWorkspace(user.id, workspace.id),
    ),
  );
  const projects = projectGroups.flatMap((result) =>
    result.ok ? result.data : [],
  );

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        name={user.name}
        email={user.email}
        workspaces={workspaces.map(({ id, name }) => ({ id, name }))}
        projects={projects.map(({ id, name }) => ({ id, name }))}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader projects={projects.map(({ id, name }) => ({ id, name }))} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function DashboardShellFallback() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside
        aria-label="Loading workspace navigation"
        className="relative hidden h-screen w-60 shrink-0 border-r border-border bg-surface lg:block"
      >
        <div className="flex h-[60px] items-center gap-2.5 border-b border-border px-4">
          <span className="size-[34px] rounded-md bg-surface-muted" />
          <span className="h-4 w-24 rounded bg-surface-muted" />
        </div>
        <div className="space-y-2 px-3 py-5">
          <span className="block h-3 w-16 rounded bg-surface-muted" />
          <span className="block h-8 rounded-md bg-surface-muted/70" />
          <span className="block h-8 rounded-md bg-surface-muted/50" />
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="size-8 rounded-md bg-surface-muted" />
          <span className="space-y-1">
            <span className="block h-3 w-20 rounded bg-surface-muted" />
            <span className="block h-2.5 w-28 rounded bg-surface-muted" />
          </span>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-[60px] items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
          <span className="h-4 w-24 rounded bg-surface-muted" />
          <div className="flex gap-2">
            <span className="h-9 w-36 rounded-md border border-border bg-surface-muted/50" />
            <span className="h-9 w-24 rounded-md bg-accent/70" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] space-y-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="space-y-2">
            <span className="block h-3 w-28 rounded bg-surface-muted" />
            <span className="block h-7 w-48 rounded bg-surface-muted" />
            <span className="block h-4 w-64 rounded bg-surface-muted/70" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-24 rounded-md border border-border bg-surface"
              />
            ))}
          </div>
          <div className="h-48 rounded-md border border-border bg-surface" />
        </main>
      </div>
    </div>
  );
}
