import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/src/modules/auth";
import { getProjectAccess } from "@/src/modules/projects";
import { getTaskAccess, listAssignableUsers } from "@/src/modules/tasks/services/task-service";
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Task</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Edit task
          </h1>
          <Link
            href={`/projects/${projectId}/tasks`}
            className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
          >
            Back to tasks
          </Link>
        </div>
        <form action={deleteTaskAction.bind(null, taskId)}>
          <input type="hidden" name="projectId" value={projectId} />
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            Delete task
          </button>
        </form>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
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