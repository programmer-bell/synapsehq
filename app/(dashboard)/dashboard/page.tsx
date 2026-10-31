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
      <div>
        <p className="text-sm font-medium text-accent">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage your workspaces and projects from one place.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted-foreground">Workspaces</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {workspaces.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted-foreground">Projects</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {projects.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {workspaces[0]?.role ?? "Member"}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Workspaces
          </h2>
          <Link
            href="/workspaces"
            className="text-sm font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        {workspaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8">
            <p className="text-sm font-medium text-foreground">
              No workspaces yet
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a workspace to start organizing projects.
            </p>
            <Link
              href="/workspaces"
              className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              Create workspace
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/workspaces/${workspace.id}`}
                className="rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/40 hover:shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {workspace.role}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                  {workspace.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {workspace.projectCount} projects · {workspace.memberCount}{" "}
                  members
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Recent projects
        </h2>
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8">
            <p className="text-sm font-medium text-foreground">
              No projects yet
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a project from a workspace to start tracking work.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/40 hover:shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {project.status}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                  {project.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
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
