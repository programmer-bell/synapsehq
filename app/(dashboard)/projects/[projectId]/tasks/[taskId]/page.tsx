import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/src/modules/auth";
import { getTaskDetails } from "@/src/modules/tasks";
import { canUpdateTask } from "@/src/modules/tasks/lib/permissions";
import { TaskCollaborationPanel } from "@/src/modules/tasks/components/task-collaboration-panel";
import { updateTaskStatusAction } from "@/src/modules/tasks/actions/task-actions";

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
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/projects/${projectId}/tasks`}
            className="text-xs font-medium text-accent hover:underline"
          >
            Back to project tasks
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {details.task.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {details.task.priority} priority · Created{" "}
            {details.task.createdAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
                className="rounded-md border border-border bg-surface px-2.5 py-2 text-sm text-foreground"
              >
                <option value="TODO">To do</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="IN_REVIEW">In review</option>
                <option value="DONE">Done</option>
              </select>
              <button
                type="submit"
                className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                Update status
              </button>
            </form>
          ) : null}
          <Link
            href={`/projects/${projectId}/tasks/${taskId}/edit`}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            Edit
          </Link>
        </div>
      </header>

      <section className="rounded-md border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {details.task.description || "No description provided."}
        </p>
      </section>

      {isSubtask ? (
        <p className="text-xs text-muted-foreground">
          This task is a subtask. Nested subtasks are not supported.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <TaskCollaborationPanel
          taskId={taskId}
          projectId={projectId}
          comments={details.comments}
          subtasks={details.subtasks}
          attachments={details.attachments}
          canEdit={canEdit}
        />
        <section className="h-fit rounded-md border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-foreground">Activity</h2>
          {details.activity.length ? (
            <ol className="mt-3 space-y-3">
              {details.activity.map((event) => (
                <li key={event.id} className="border-l border-border pl-3">
                  <p className="text-xs text-foreground">{event.summary}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {event.actorName ?? "A former member"} ·{" "}
                    {event.createdAt.toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              No activity recorded yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
