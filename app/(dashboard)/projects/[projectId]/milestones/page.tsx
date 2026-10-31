import Link from "next/link";
import { notFound } from "next/navigation";

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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="text-xs font-medium text-accent hover:underline"
          >
            {project.project.name}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Milestones
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track delivery dates and linked task completion.
          </p>
        </div>
        <Link
          href={`/projects/${projectId}/tasks`}
          className="text-sm font-medium text-accent hover:underline"
        >
          View tasks
        </Link>
      </header>

      <section className="rounded-md border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Overall task completion
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {progress.taskProgress.completed} of {progress.taskProgress.total}{" "}
              tasks complete
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {progress.taskProgress.total
              ? Math.round(
                  (progress.taskProgress.completed /
                    progress.taskProgress.total) *
                    100,
                )
              : 0}
            %
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded bg-surface-muted">
          <div
            className="h-full rounded bg-accent"
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

      {progress.canManage ? (
        <section className="rounded-md border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Add milestone
          </h2>
          <CreateMilestoneForm projectId={projectId} />
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
            return (
              <li
                key={milestone.id}
                className="rounded-md border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-foreground">
                      {milestone.name}
                    </h2>
                    {milestone.description ? (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {milestone.dueDate
                        ? `Due ${milestone.dueDate.toLocaleDateString()}`
                        : "No due date"}
                      {" · "}
                      {milestone.completedTaskCount} of {milestone.taskCount}{" "}
                      linked tasks complete
                    </p>
                  </div>
                  {progress.canManage ? (
                    <form action={updateMilestoneStatusAction}>
                      <input
                        type="hidden"
                        name="milestoneId"
                        value={milestone.id}
                      />
                      <select
                        name="status"
                        defaultValue={milestone.status}
                        aria-label={`${milestone.name} status`}
                        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      >
                        <option value="PLANNED">Planned</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      <button
                        type="submit"
                        className="ml-2 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
                      >
                        Save
                      </button>
                    </form>
                  ) : (
                    <span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                      {milestone.status.replace("_", " ")}
                    </span>
                  )}
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded bg-surface-muted">
                  <div
                    className="h-full rounded bg-emerald-600 dark:bg-emerald-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-surface px-5 py-8">
          <p className="text-sm font-medium text-foreground">
            No milestones yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a milestone to define a delivery target.
          </p>
        </div>
      )}
    </div>
  );
}
