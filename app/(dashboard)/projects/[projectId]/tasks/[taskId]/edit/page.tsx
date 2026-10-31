import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/src/modules/auth";
import { getProjectAccess } from "@/src/modules/projects";
import {
  getTaskAccess,
  listAssignableUsers,
} from "@/src/modules/tasks/services/task-service";
import { UpdateTaskForm } from "@/src/modules/tasks/components/update-task-form";
import { deleteTaskAction } from "@/src/modules/tasks/actions/task-actions";

type EditTaskPageProps = {
  params: Promise<{ projectId: string; taskId: string }>;
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { projectId, taskId } = await params;
  const user = await requireUser();
  const projectAccess = await getProjectAccess(user.id, projectId);
  const taskAccess = await getTaskAccess(user.id, taskId);

  if (!projectAccess || !taskAccess || taskAccess.projectId !== projectId) {
    notFound();
  }

  const assignableResult = await listAssignableUsers(user.id, projectId);
  const assignableUsers = assignableResult.ok ? assignableResult.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Task</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
            Edit task
          </h1>
          <Link
            href={`/projects/${projectId}/tasks`}
            className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
          >
            Back to tasks
          </Link>
        </div>
        <form action={deleteTaskAction.bind(null, taskId)}>
          <input type="hidden" name="projectId" value={projectId} />
          <button
            type="submit"
            className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            Delete task
          </button>
        </form>
      </div>

      <section className="rounded-md border border-border bg-surface p-4">
        <UpdateTaskForm
          taskId={taskId}
          projectId={projectId}
          initialTitle={taskAccess.task.title}
          initialDescription={taskAccess.task.description}
          initialStatus={taskAccess.task.status}
          initialPriority={taskAccess.task.priority}
          initialAssigneeId={taskAccess.task.assigneeId}
          initialDueDate={taskAccess.task.dueDate?.toISOString() ?? null}
          assignableUsers={assignableUsers}
        />
      </section>
    </div>
  );
}
