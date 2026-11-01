import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  FolderKanban,
  Plus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/src/modules/auth";
import { listWorkspacesForUserWithSummary } from "@/src/modules/workspaces";
import { CreateWorkspaceForm } from "@/src/modules/workspaces/components/create-workspace-form";

export default async function WorkspacesPage() {
  const user = await requireUser();
  const workspaces = await listWorkspacesForUserWithSummary(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspaces"
        title="Your workspaces"
        description="Create and manage the workspaces that organize your projects, teams, and access."
        icon={<Building2 aria-hidden="true" />}
      />

      <section
        id="create-workspace"
        className="scroll-mt-20 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-start gap-2.5 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
            <Plus aria-hidden="true" className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Create workspace
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              A workspace groups projects and the people working on them.
            </p>
          </div>
        </div>
        <div className="p-4">
          <CreateWorkspaceForm />
        </div>
      </section>

      {workspaces.length === 0 ? (
        <EmptyState
          icon={<Building2 aria-hidden="true" />}
          title="No workspaces yet"
          description="Create your first workspace above to start organizing projects and inviting teammates."
        />
      ) : (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.id}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 text-sm font-semibold text-accent">
                    {workspace.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
                      {workspace.name}
                    </h2>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <FolderKanban aria-hidden="true" className="size-3" />
                      {workspace.projectCount} projects
                      <span aria-hidden="true">·</span>
                      <Users aria-hidden="true" className="size-3" />
                      {workspace.memberCount} members
                    </p>
                  </div>
                </div>
                <Badge variant="violet">{workspace.role}</Badge>
              </div>
              <span className="mt-4 flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-accent">
                Open workspace
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
