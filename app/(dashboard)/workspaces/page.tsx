import Link from "next/link";

import { requireUser } from "@/src/modules/auth";
import { listWorkspacesForUserWithSummary } from "@/src/modules/workspaces/services/workspace-service";
import { CreateWorkspaceForm } from "@/src/modules/workspaces/components/create-workspace-form";

export default async function WorkspacesPage() {
  const user = await requireUser();
  const workspaces = await listWorkspacesForUserWithSummary(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Workspaces
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
            Your workspaces
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
            Create and manage the workspaces that organize your projects.
          </p>
        </div>
      </div>

      <section className="rounded-md border border-border bg-surface p-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Create workspace
        </h2>
        <div className="mt-4">
          <CreateWorkspaceForm />
        </div>
      </section>

      {workspaces.length === 0 ? (
        <section className="rounded-md border border-dashed border-border bg-surface px-5 py-8">
          <p className="text-sm font-medium text-foreground">
            No workspaces yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first workspace to start organizing projects.
          </p>
        </section>
      ) : (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.id}`}
              className="rounded-md border border-border bg-surface p-4 transition-colors duration-150 hover:border-accent/50 hover:bg-surface-muted/50"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {workspace.name}
                </h2>
                <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {workspace.role}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
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
