import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  FolderKanban,
  Gauge,
  ListChecks,
  Milestone,
  Settings,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
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
  const percent = progress?.taskProgress.total
    ? Math.round(
        (progress.taskProgress.completed / progress.taskProgress.total) * 100,
      )
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title={access.project.name}
        description={access.project.description || "No description provided."}
        icon={<FolderKanban aria-hidden="true" />}
        actions={
          <>
            <Link
              href={`/projects/${projectId}/tasks`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 active:scale-[0.98]"
            >
              <ListChecks aria-hidden="true" className="size-4" />
              View tasks
            </Link>
            {canManage ? (
              <form action={deleteProjectAction.bind(null, projectId)}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/5 px-3.5 text-sm font-medium text-rose-700 transition-all duration-200 hover:bg-rose-500/10 active:scale-[0.98] dark:text-rose-300"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete
                </button>
              </form>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={access.project.status === "ACTIVE" ? "success" : "outline"}
          dot
        >
          {access.project.status}
        </Badge>
        <Badge variant="violet">{access.role}</Badge>
        {workspaceAccess ? (
          <Link
            href={`/workspaces/${workspaceAccess.workspace.id}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowUpRight aria-hidden="true" className="size-3" />
            {workspaceAccess.workspace.name}
          </Link>
        ) : null}
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Gauge aria-hidden="true" className="size-3" />
            Progress
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {percent}%
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <ListChecks aria-hidden="true" className="size-3" />
            Tasks complete
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {progress?.taskProgress.completed ?? 0}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {progress?.taskProgress.total ?? 0}
            </span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Top-level tasks finished
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-3" />
            Milestones
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {progress?.milestones.length ?? 0}
          </p>
          <Link
            href={`/projects/${projectId}/milestones`}
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-accent transition-colors hover:text-accent/80"
          >
            View milestones
            <ArrowRight aria-hidden="true" className="size-3" />
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Settings aria-hidden="true" className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Details
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              What this project is delivering.
            </p>
          </div>
        </div>
        <p className="whitespace-pre-wrap p-4 text-sm leading-6 text-muted-foreground">
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
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
            <div className="flex items-start gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                <Milestone aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Project progress
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {progress.taskProgress.completed} of{" "}
                  {progress.taskProgress.total} top-level tasks complete
                </p>
              </div>
            </div>
            <Link
              href={`/projects/${projectId}/milestones`}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent/80"
            >
              Milestones
              <ArrowRight aria-hidden="true" className="size-3" />
            </Link>
          </div>
          <div className="p-4">
            <div
              className="h-2 overflow-hidden rounded-full bg-surface-muted"
              role="progressbar"
              aria-label="Project task completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-[width] duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </section>
      ) : null}

      {canManage ? (
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300">
              <Settings aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Edit project
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Update the name, description, or delivery status.
              </p>
            </div>
          </div>
          <div className="max-w-2xl p-4">
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
        <div className="flex items-start gap-3">
          <div className="size-11 animate-pulse rounded-xl bg-surface-muted" />
          <div className="space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-surface-muted" />
            <div className="h-7 w-56 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-surface-muted/70" />
          </div>
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {["progress", "tasks", "milestones"].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl border border-border bg-card" />
      <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  );
}
