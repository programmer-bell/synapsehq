import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  FolderKanban,
  ShieldCheck,
  Trash2,
  UserMinus,
  Users,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        eyebrow="Workspace"
        title={access.workspace.name}
        description={`/${access.workspace.slug} · ${access.membership.role.toLowerCase()} access`}
        icon={<Building2 aria-hidden="true" />}
        actions={
          canDeleteWorkspace ? (
            <form action={deleteWorkspaceAction.bind(null, workspaceId)}>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/5 px-3.5 text-sm font-medium text-rose-700 transition-all duration-200 hover:bg-rose-500/10 active:scale-[0.98] dark:text-rose-300"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete workspace
              </button>
            </form>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <div className="space-y-4">
          {canManageWorkspace ? (
            <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-start gap-2.5 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Workspace settings
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Rename the workspace to keep navigation clear.
                  </p>
                </div>
              </div>
              <div className="max-w-xl p-4">
                <UpdateWorkspaceForm
                  workspaceId={workspaceId}
                  initialName={access.workspace.name}
                />
              </div>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
                  <Users aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Members
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Control who can access projects in this workspace.
                  </p>
                </div>
              </div>
              <Badge variant="violet">{members.length} total</Badge>
            </div>
            <div className="p-4">
              {canManageWorkspace ? (
                <div className="mb-4 rounded-lg border border-border/70 bg-surface-muted/25 p-3">
                  <AddWorkspaceMemberForm workspaceId={workspaceId} />
                </div>
              ) : null}
              <ul className="divide-y divide-border/70">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex flex-col gap-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar
                        name={member.user?.name ?? "Unknown user"}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {member.user?.name ?? "Unknown user"}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {member.user?.email ?? member.userId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          member.role === "OWNER"
                            ? "warning"
                            : member.role === "ADMIN"
                              ? "violet"
                              : "outline"
                        }
                      >
                        {member.role}
                      </Badge>
                      {canManageWorkspace &&
                      member.userId !== access.workspace.ownerId ? (
                        <form action={removeMemberAction}>
                          <input
                            type="hidden"
                            name="userId"
                            value={member.userId}
                          />
                          <button
                            type="submit"
                            aria-label={`Remove ${member.user?.name ?? "member"}`}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300"
                          >
                            <UserMinus
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Workspace pulse
              </h2>
              <Badge variant="success" dot>
                Active
              </Badge>
            </div>
            <dl className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <FolderKanban aria-hidden="true" className="size-3.5" />
                  Projects
                </dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {projects.length}
                </dd>
              </div>
              <div className="flex items-center justify-between text-xs">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Users aria-hidden="true" className="size-3.5" />
                  Members
                </dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {members.length}
                </dd>
              </div>
              <div className="flex items-center justify-between text-xs">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <ShieldCheck aria-hidden="true" className="size-3.5" />
                  Your role
                </dt>
                <dd className="font-semibold capitalize text-foreground">
                  {access.membership.role.toLowerCase()}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Projects
            </h2>
            <p className="text-xs text-muted-foreground">
              Delivery streams that belong to this workspace.
            </p>
          </div>
          {hasProjectCreatePermission(access.membership.role) ? (
            <CreateProjectDialog workspaceId={workspaceId} />
          ) : null}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban aria-hidden="true" />}
            title="No projects yet"
            description="Create a project to start tracking tasks, milestones, and team allocation in this workspace."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300">
                      <FolderKanban aria-hidden="true" className="size-4" />
                    </span>
                    <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                      {project.name}
                    </h3>
                  </div>
                  <Badge
                    variant={
                      project.status === "ACTIVE" ? "success" : "outline"
                    }
                    dot
                  >
                    {project.status}
                  </Badge>
                </div>
                <p className="mt-3 line-clamp-3 text-xs leading-5 text-muted-foreground">
                  {project.description || "No description provided."}
                </p>
                <span className="mt-3 flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-accent">
                  View project
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
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
