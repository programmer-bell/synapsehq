import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/src/modules/auth";
import { getProjectAccess } from "@/src/modules/projects";
import { getProjectMilestones } from "@/src/modules/projects";
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

  const [assignableResult, milestoneResult] = await Promise.all([
    listAssignableUsers(user.id, projectId),
    getProjectMilestones(user.id, projectId),
  ]);
  const assignableUsers = assignableResult.ok ? assignableResult.data : [];
  const milestones =
    milestoneResult?.milestones.map(({ id, name }) => ({ id, name })) ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        href={`/projects/${projectId}/tasks`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        Back to tasks
      </Link>

      <PageHeader
        eyebrow="Task"
        title="Edit task"
        description="Update the task details, ownership, and delivery plan."
        icon={<Pencil aria-hidden="true" />}
        actions={
          <form action={deleteTaskAction.bind(null, taskId)}>
            <input type="hidden" name="projectId" value={projectId} />
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/5 px-3.5 text-sm font-medium text-rose-700 transition-all duration-200 hover:bg-rose-500/10 active:scale-[0.98] dark:text-rose-300"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Delete task
            </button>
          </form>
        }
      />

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Pencil aria-hidden="true" className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Task details
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Changes are saved to the project immediately.
            </p>
          </div>
        </div>
        <div className="p-4">
          <UpdateTaskForm
            taskId={taskId}
            projectId={projectId}
            initialTitle={taskAccess.task.title}
            initialDescription={taskAccess.task.description}
            initialStatus={taskAccess.task.status}
            initialPriority={taskAccess.task.priority}
            initialAssigneeId={taskAccess.task.assigneeId}
            initialDueDate={taskAccess.task.dueDate?.toISOString() ?? null}
            initialMilestoneId={taskAccess.task.milestoneId}
            assignableUsers={assignableUsers}
            milestones={milestones}
          />
        </div>
      </section>
    </div>
  );
}
