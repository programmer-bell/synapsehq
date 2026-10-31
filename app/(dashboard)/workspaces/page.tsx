import Link from "next/link";

import { requireUser } from "@/src/modules/auth";
import { listWorkspacesForUserWithSummary } from "@/src/modules/workspaces/services/workspace-service";
import { CreateWorkspaceForm } from "@/src/modules/workspaces/components/create-workspace-form";

export default async function WorkspacesPage() {
  const user = await requireUser();
  const workspaces = await listWorkspacesForUserWithSummary(user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Workspaces</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Your workspaces
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Create and manage the workspaces that organize your projects.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Create workspace
        </h2>
        <div className="mt-4">
          <CreateWorkspaceForm />
        </div>
      </section>

      {workspaces.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface p-8">
          <p className="text-sm font-medium text-foreground">
            No workspaces yet
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first workspace to start organizing projects.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.id}`}
              className="rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/40 hover:shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {workspace.role}
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                {workspace.name}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {workspace.projectCount} projects · {workspace.memberCount}{" "}
                members
              </p>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
