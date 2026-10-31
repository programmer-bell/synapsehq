import Link from "next/link";

import { requireUser } from "@/src/modules/auth";
import { listWorkspacesForUserWithSummary } from "@/src/modules/workspaces/services/workspace-service";
import { listProjectsForWorkspace } from "@/src/modules/projects/services/project-service";

export default async function DashboardPage() {
  const user = await requireUser();
  const workspaces = await listWorkspacesForUserWithSummary(user.id);

  const projectGroups = await Promise.all(
    workspaces.map(async (workspace) => {
      const result = await listProjectsForWorkspace(user.id, workspace.id);
      return result.ok
        ? result.data.map((project) => ({ ...project, workspace }))
        : [];
    }),
  );
  const projects = projectGroups.flat();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Workspace overview
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
            Good to see you, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your workspaces and projects, all in one place.
          </p>
        </div>
        <Link
          href="/workspaces"
          className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-3.5 text-sm font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent/90"
        >
          View workspaces
        </Link>
      </div>

      <section
        aria-label="Workspace statistics"
        className="grid gap-3 md:grid-cols-3"
      >
        <div className="rounded-md border border-border bg-surface px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground">
            Workspaces
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {workspaces.length}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground">Projects</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {projects.length}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground">Your role</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            {workspaces[0]?.role ?? "Member"}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Workspaces
          </h2>
          <Link
            href="/workspaces"
            className="text-xs font-medium text-accent transition-colors hover:text-accent/80"
          >
            View all
          </Link>
        </div>
        {workspaces.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface px-5 py-8">
            <p className="text-sm font-medium text-foreground">
              No workspaces yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a workspace to start organizing projects.
            </p>
            <Link
              href="/workspaces"
              className="mt-4 inline-flex h-9 items-center rounded-md bg-accent px-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Create workspace
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/workspaces/${workspace.id}`}
                className="rounded-md border border-border bg-surface p-4 transition-colors duration-150 hover:border-accent/50 hover:bg-surface-muted/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                    {workspace.name}
                  </h3>
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {workspace.role}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {workspace.projectCount} projects
                  <span className="px-1.5 text-border">·</span>
                  {workspace.memberCount} members
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Recent projects
        </h2>
        {projects.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface px-5 py-8">
            <p className="text-sm font-medium text-foreground">
              No projects yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a project from a workspace to start tracking work.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-md border border-border bg-surface p-4 transition-colors duration-150 hover:border-accent/50 hover:bg-surface-muted/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                    {project.name}
                  </h3>
                  <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {project.status}
                  </span>
                </div>
                <p className="mt-2 truncate text-xs text-muted-foreground">
                  {project.workspace.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
