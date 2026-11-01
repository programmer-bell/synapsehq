import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Flag,
  ListChecks,
  Milestone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/src/modules/auth";
import { getProjectAccess, getProjectMilestones } from "@/src/modules/projects";
import { CreateMilestoneForm } from "@/src/modules/projects/components/create-milestone-form";
import { updateMilestoneStatusAction } from "@/src/modules/projects/actions/project-work-actions";

export default async function ProjectMilestonesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();
  const [project, progress] = await Promise.all([
    getProjectAccess(user.id, projectId),
    getProjectMilestones(user.id, projectId),
  ]);
  if (!project || !progress) notFound();

  const percent = progress.taskProgress.total
    ? Math.round(
        (progress.taskProgress.completed / progress.taskProgress.total) * 100,
      )
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={project.project.name}
        title="Milestones"
        description="Track delivery dates and linked task completion across the project."
        icon={<Milestone aria-hidden="true" />}
        actions={
          <>
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:text-accent active:scale-[0.98]"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Project
            </Link>
            <Link
              href={`/projects/${projectId}/tasks`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 active:scale-[0.98]"
            >
              <ListChecks aria-hidden="true" className="size-4" />
              View tasks
            </Link>
          </>
        }
      />

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Overall task completion
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {progress.taskProgress.completed} of {progress.taskProgress.total}{" "}
              tasks complete
            </p>
          </div>
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {percent}%
          </span>
        </div>
        <div className="p-4">
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </section>

      {progress.canManage ? (
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
              <Flag aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Add milestone
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Define a delivery target and track linked tasks.
              </p>
            </div>
          </div>
          <div className="p-4">
            <CreateMilestoneForm projectId={projectId} />
          </div>
        </section>
      ) : null}

      {progress.milestones.length ? (
        <ul className="space-y-3">
          {progress.milestones.map((milestone) => {
            const percent = milestone.taskCount
              ? Math.round(
                  (milestone.completedTaskCount / milestone.taskCount) * 100,
                )
              : milestone.status === "COMPLETED"
                ? 100
                : 0;
            const isComplete = milestone.status === "COMPLETED";
            return (
              <li
                key={milestone.id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <div className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground">
                          {milestone.name}
                        </h2>
                        <Badge
                          variant={
                            isComplete
                              ? "success"
                              : milestone.status === "IN_PROGRESS"
                                ? "warning"
                                : "outline"
                          }
                          dot
                        >
                          {milestone.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {milestone.description ? (
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {milestone.description}
                        </p>
                      ) : null}
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays aria-hidden="true" className="size-3" />
                          {milestone.dueDate
                            ? `Due ${milestone.dueDate.toLocaleDateString()}`
                            : "No due date"}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 aria-hidden="true" className="size-3" />
                          {milestone.completedTaskCount} of{" "}
                          {milestone.taskCount} linked tasks complete
                        </span>
                      </p>
                    </div>
                    {progress.canManage ? (
                      <form
                        action={updateMilestoneStatusAction}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="hidden"
                          name="milestoneId"
                          value={milestone.id}
                        />
                        <select
                          name="status"
                          defaultValue={milestone.status}
                          aria-label={`${milestone.name} status`}
                          className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground shadow-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                        >
                          <option value="PLANNED">Planned</option>
                          <option value="IN_PROGRESS">In progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                        <button
                          type="submit"
                          className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:text-accent active:scale-[0.98]"
                        >
                          Save
                        </button>
                      </form>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                      {percent}%
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<Milestone aria-hidden="true" />}
          title="No milestones yet"
          description="Add a milestone to define a delivery target and connect it to project tasks."
        />
      )}
    </div>
  );
}
