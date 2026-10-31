import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/src/modules/auth";
import {
  getWorkspaceAccess,
  listWorkspaceMembersForUser,
} from "@/src/modules/workspaces/services/workspace-service";
import { listProjectsForWorkspace } from "@/src/modules/projects/services/project-service";
import { UpdateWorkspaceForm } from "@/src/modules/workspaces/components/update-workspace-form";
import { AddWorkspaceMemberForm } from "@/src/modules/workspaces/components/add-workspace-member-form";
import { CreateProjectDialog } from "@/src/modules/projects/components/create-project-dialog";
import {
  deleteWorkspaceAction,
  removeWorkspaceMemberAction,
} from "@/src/modules/workspaces/actions/workspace-actions";

type WorkspaceDetailPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceDetailPage({
  params,
}: WorkspaceDetailPageProps) {
  const { workspaceId } = await params;
  const user = await requireUser();
  const access = await getWorkspaceAccess(user.id, workspaceId);

  if (!access) {
    notFound();
  }

  const membersResult = await listWorkspaceMembersForUser(user.id, workspaceId);
  const projectsResult = await listProjectsForWorkspace(user.id, workspaceId);
  const members = membersResult.ok ? membersResult.data : [];
  const projects = projectsResult.ok ? projectsResult.data : [];
  const canManageWorkspace =
    access.membership.role === "OWNER" || access.membership.role === "ADMIN";
  const canDeleteWorkspace = access.membership.role === "OWNER";

  const removeMemberAction = removeWorkspaceMemberAction.bind(
    null,
    workspaceId,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Workspace</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
            {access.workspace.name}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            /{access.workspace.slug} · {access.membership.role}
          </p>
        </div>
        {canDeleteWorkspace ? (
          <form action={deleteWorkspaceAction.bind(null, workspaceId)}>
            <button
              type="submit"
              className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              Delete workspace
            </button>
          </form>
        ) : null}
      </div>

      {canManageWorkspace ? (
        <section className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Workspace settings
          </h2>
          <div className="mt-4 max-w-xl">
            <UpdateWorkspaceForm
              workspaceId={workspaceId}
              initialName={access.workspace.name}
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-md border border-border bg-surface p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Members
          </h2>
        </div>
        <div className="mt-4">
          {canManageWorkspace ? (
            <AddWorkspaceMemberForm workspaceId={workspaceId} />
          ) : null}
        </div>
        <div className="mt-6 space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 rounded-md border border-border bg-background px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {member.user?.name ?? "Unknown user"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.user?.email ?? member.userId} · {member.role}
                </p>
              </div>
              {canManageWorkspace &&
              member.userId !== access.workspace.ownerId ? (
                <form action={removeMemberAction}>
                  <input type="hidden" name="userId" value={member.userId} />
                  <button
                    type="submit"
                    className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground transition-colors duration-150 hover:bg-surface-muted"
                  >
                    Remove
                  </button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Projects
          </h2>
          {hasProjectCreatePermission(access.membership.role) ? (
            <CreateProjectDialog workspaceId={workspaceId} />
          ) : null}
        </div>

        {projects.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface px-5 py-8">
            <p className="text-sm font-medium text-foreground">
              No projects yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a project to start tracking work in this workspace.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
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
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                  {project.description || "No description provided."}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function hasProjectCreatePermission(role: "OWNER" | "ADMIN" | "MEMBER") {
  return role === "OWNER" || role === "ADMIN" || role === "MEMBER";
}
