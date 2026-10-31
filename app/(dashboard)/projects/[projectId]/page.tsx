import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { requireUser } from "@/src/modules/auth";
import {
  getProjectAccess,
  getProjectMilestones,
  getProjectTeam,
} from "@/src/modules/projects";
import { getWorkspaceAccess } from "@/src/modules/workspaces/services/workspace-service";
import { UpdateProjectForm } from "@/src/modules/projects/components/update-project-form";
import { deleteProjectAction } from "@/src/modules/projects/actions/project-actions";
import { ProjectTeamPanel } from "@/src/modules/projects/components/project-team-panel";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  return (
    <Suspense fallback={<ProjectDetailPageFallback />}>
      <ProjectDetailContent params={params} />
    </Suspense>
  );
}

async function ProjectDetailContent({ params }: ProjectDetailPageProps) {
  const { projectId } = await params;
  const user = await requireUser();
  const access = await getProjectAccess(user.id, projectId);

  if (!access) {
    notFound();
  }

  const [workspaceAccess, team, progress] = await Promise.all([
    getWorkspaceAccess(user.id, access.workspaceId),
    getProjectTeam(user.id, projectId),
    getProjectMilestones(user.id, projectId),
  ]);
  const canManage =
    access.role === "OWNER" ||
    access.role === "ADMIN" ||
    access.createdBy === user.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Project</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
            {access.project.name}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {access.project.status} · Created in workspace
          </p>
          {workspaceAccess ? (
            <Link
              href={`/workspaces/${workspaceAccess.workspace.id}`}
              className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
            >
              Back to {workspaceAccess.workspace.name}
            </Link>
          ) : null}
          <Link
            href={`/projects/${projectId}/tasks`}
            className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
          >
            View tasks
          </Link>
        </div>
        {canManage ? (
          <form action={deleteProjectAction.bind(null, projectId)}>
            <button
              type="submit"
              className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              Delete project
            </button>
          </form>
        ) : null}
      </div>

      <section className="rounded-md border border-border bg-surface p-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Details
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {access.project.description || "No description provided."}
        </p>
      </section>

      {team ? (
        <ProjectTeamPanel
          projectId={projectId}
          members={team.members}
          candidates={team.candidates}
          canManage={team.canManage}
        />
      ) : null}

      {progress ? (
        <section className="rounded-md border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Project progress
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {progress.taskProgress.completed} of{" "}
                {progress.taskProgress.total} top-level tasks complete
              </p>
            </div>
            <Link
              href={`/projects/${projectId}/milestones`}
              className="text-sm font-medium text-accent hover:underline"
            >
              Milestones
            </Link>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded bg-surface-muted"
            role="progressbar"
            aria-label="Project task completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              progress.taskProgress.total
                ? Math.round(
                    (progress.taskProgress.completed /
                      progress.taskProgress.total) *
                      100,
                  )
                : 0
            }
          >
            <div
              className="h-full rounded bg-accent transition-[width]"
              style={{
                width: `${
                  progress.taskProgress.total
                    ? Math.round(
                        (progress.taskProgress.completed /
                          progress.taskProgress.total) *
                          100,
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </section>
      ) : null}

      {canManage ? (
        <section className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Edit project
          </h2>
          <div className="mt-4 max-w-2xl">
            <UpdateProjectForm
              projectId={projectId}
              initialName={access.project.name}
              initialDescription={access.project.description}
              initialStatus={access.project.status}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ProjectDetailPageFallback() {
  return (
    <div className="space-y-6" aria-label="Loading project details">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-surface-muted" />
          <div className="h-7 w-56 rounded bg-surface-muted" />
          <div className="h-4 w-48 rounded bg-surface-muted/70" />
        </div>
        <div className="h-9 w-32 rounded-md border border-border bg-surface" />
      </div>
      <section className="space-y-4 rounded-md border border-border bg-surface p-4">
        <div className="h-5 w-20 rounded bg-surface-muted" />
        <div className="h-4 w-full rounded bg-surface-muted/70" />
        <div className="h-4 w-2/3 rounded bg-surface-muted/70" />
      </section>
      <section className="space-y-4 rounded-md border border-border bg-surface p-4">
        <div className="h-5 w-28 rounded bg-surface-muted" />
        <div className="h-16 rounded bg-surface-muted/50" />
      </section>
      <section className="space-y-4 rounded-md border border-border bg-surface p-4">
        <div className="h-5 w-32 rounded bg-surface-muted" />
        <div className="h-2 rounded bg-surface-muted" />
      </section>
    </div>
  );
}
