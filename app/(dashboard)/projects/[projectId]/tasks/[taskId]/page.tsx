import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CircleDot,
  ListChecks,
  Pencil,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Badge, priorityVariant, statusVariant } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/src/modules/auth";
import { getTaskDetails } from "@/src/modules/tasks";
import { canUpdateTask } from "@/src/modules/tasks/lib/permissions";
import { TaskCollaborationPanel } from "@/src/modules/tasks/components/task-collaboration-panel";
import { updateTaskStatusAction } from "@/src/modules/tasks/actions/task-actions";

function readableLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; taskId: string }>;
}) {
  const { projectId, taskId } = await params;
  const user = await requireUser();
  const details = await getTaskDetails(user.id, taskId);
  if (!details || details.projectId !== projectId) notFound();

  const canEdit = canUpdateTask(
    details.role,
    details.createdBy,
    details.assigneeId,
    user.id,
  );
  const isSubtask = details.task.parentTaskId !== null;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href={`/projects/${projectId}/tasks`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        Back to project tasks
      </Link>

      <PageHeader
        eyebrow="Task details"
        title={details.task.title}
        description={
          details.task.description || "No description has been added yet."
        }
        icon={<ListChecks aria-hidden="true" />}
        actions={
          <>
            {canEdit ? (
              <form
                action={updateTaskStatusAction.bind(null, taskId)}
                className="flex items-center gap-2"
              >
                <input type="hidden" name="projectId" value={projectId} />
                <select
                  name="status"
                  defaultValue={details.task.status}
                  aria-label="Task status"
                  className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground shadow-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="TODO">To do</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="IN_REVIEW">In review</option>
                  <option value="DONE">Done</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:text-accent active:scale-[0.98]"
                >
                  <Sparkles aria-hidden="true" className="size-3.5" />
                  Update
                </button>
              </form>
            ) : null}
            <Link
              href={`/projects/${projectId}/tasks/${taskId}/edit`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 active:scale-[0.98]"
            >
              <Pencil aria-hidden="true" className="size-4" />
              Edit task
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant(details.task.status)} dot>
          {readableLabel(details.task.status)}
        </Badge>
        <Badge variant={priorityVariant(details.task.priority)} dot>
          {readableLabel(details.task.priority)} priority
        </Badge>
        {details.task.dueDate ? (
          <Badge variant="outline">
            <CalendarDays aria-hidden="true" className="size-3" />
            Due {details.task.dueDate.toLocaleDateString()}
          </Badge>
        ) : null}
        <Badge variant="slate">
          <UserRound aria-hidden="true" className="size-3" />
          {details.assigneeId ? "Assigned" : "Unassigned"}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          Created {details.task.createdAt.toLocaleDateString()}
        </span>
      </div>

      {isSubtask ? (
        <p className="flex items-center gap-2 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3.5 py-2.5 text-xs text-sky-800 dark:text-sky-200">
          <CircleDot aria-hidden="true" className="size-3.5 shrink-0" />
          This task is a subtask. Nested subtasks are not supported.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <CircleDot aria-hidden="true" className="size-4" />
              </span>
              <h2 className="text-sm font-semibold text-foreground">
                Description
              </h2>
            </div>
            <p className="whitespace-pre-wrap p-4 text-sm leading-6 text-muted-foreground">
              {details.task.description || "No description provided."}
            </p>
          </section>

          <TaskCollaborationPanel
            taskId={taskId}
            projectId={projectId}
            comments={details.comments}
            subtasks={details.subtasks}
            attachments={details.attachments}
            canEdit={canEdit}
          />
        </div>

        <aside className="h-fit overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:sticky lg:top-[76px]">
          <div className="flex items-center gap-2.5 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
              <Activity aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Activity
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                A timeline of changes on this task.
              </p>
            </div>
          </div>
          <div className="p-4">
            {details.activity.length ? (
              <ol className="relative space-y-3 border-l border-border pl-4">
                {details.activity.map((event) => (
                  <li key={event.id} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[21px] top-1.5 size-2 rounded-full border-2 border-card bg-accent"
                    />
                    <p className="text-xs leading-5 text-foreground">
                      {event.summary}
                    </p>
                    <p
                      suppressHydrationWarning
                      className="mt-1 text-[10px] text-muted-foreground"
                    >
                      {event.actorName ?? "A former member"} ·{" "}
                      {event.createdAt.toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-surface-muted/20 px-3 py-5 text-center text-xs text-muted-foreground">
                No activity recorded yet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
