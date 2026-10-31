import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/src/modules/auth";
import { getProjectAccess, getProjectMilestones } from "@/src/modules/projects";
import {
  listAssignableUsers,
  listTasksForProject,
} from "@/src/modules/tasks/services/task-service";
import { taskFiltersSchema } from "@/src/modules/tasks/schemas/task";
import { CreateTaskDialog } from "@/src/modules/tasks/components/create-task-dialog";
import { TaskFilters } from "@/src/modules/tasks/components/task-filters";
import { TaskKanban } from "@/src/modules/tasks/components/task-kanban";
import { TaskTable } from "@/src/modules/tasks/components/task-table";

type TasksPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectTasksPage({
  params,
  searchParams,
}: TasksPageProps) {
  const { projectId } = await params;
  const rawSearchParams = await searchParams;
  const user = await requireUser();
  const access = await getProjectAccess(user.id, projectId);

  if (!access) {
    notFound();
  }

  const parsedFilters = taskFiltersSchema.safeParse({
    search: firstValue(rawSearchParams.search),
    status: firstValue(rawSearchParams.status),
    priority: firstValue(rawSearchParams.priority),
    assigneeId: firstValue(rawSearchParams.assigneeId),
    dueBefore: firstValue(rawSearchParams.dueBefore),
    dueAfter: firstValue(rawSearchParams.dueAfter),
    sortBy: firstValue(rawSearchParams.sortBy),
    sortDirection: firstValue(rawSearchParams.sortDirection),
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
  });

  const filters = parsedFilters.success
    ? parsedFilters.data
    : taskFiltersSchema.parse({});
  const view =
    firstValue(rawSearchParams.view) === "table" ? "table" : "kanban";
  const actionError = firstValue(rawSearchParams.actionError);

  const [tasksResult, assignableResult, projectMilestones] = await Promise.all([
    listTasksForProject(user.id, projectId, filters),
    listAssignableUsers(user.id, projectId),
    getProjectMilestones(user.id, projectId),
  ]);

  const tasks = tasksResult.ok ? tasksResult.data : [];
  const assignableUsers = assignableResult.ok ? assignableResult.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {access.project.name}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
            Tasks
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Keep the team aligned and work moving forward.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface-muted"
          >
            Project settings
          </Link>
          <CreateTaskDialog
            projectId={projectId}
            assignableUsers={assignableUsers}
            milestones={
              projectMilestones?.milestones.map(({ id, name }) => ({
                id,
                name,
              })) ?? []
            }
          />
        </div>
      </div>

      <TaskFilters
        projectId={projectId}
        filters={filters}
        view={view}
        assignableUsers={assignableUsers}
      />

      {actionError === "task-status-update" || actionError === "task-delete" ? (
        <div
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {actionError === "task-status-update"
            ? "We couldn’t update the task status. Please try again."
            : "We couldn’t delete the task. Please try again."}{" "}
          <Link
            href={`/projects/${projectId}/tasks?view=${view}`}
            className="font-medium underline underline-offset-2"
          >
            Dismiss
          </Link>
        </div>
      ) : null}

      {!assignableResult.ok ? (
        <p
          role="alert"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
        >
          Assignee options are temporarily unavailable. You can still create
          unassigned tasks.
        </p>
      ) : null}

      <div className="flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-5">
          <Link
            href={`/projects/${projectId}/tasks?${new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, String(value)])), view: "kanban" }).toString()}`}
            className={`border-b-2 px-1 py-2.5 text-sm font-medium transition-colors duration-150 ${view === "kanban" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Kanban
          </Link>
          <Link
            href={`/projects/${projectId}/tasks?${new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, String(value)])), view: "table" }).toString()}`}
            className={`border-b-2 px-1 py-2.5 text-sm font-medium transition-colors duration-150 ${view === "table" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Table
          </Link>
        </div>
        <span className="pb-2.5 text-xs text-muted-foreground">
          {tasksResult.ok
            ? `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`
            : "Tasks unavailable"}
        </span>
      </div>

      {!tasksResult.ok ? (
        <div
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-4 py-4 dark:border-rose-900/60 dark:bg-rose-950/40"
        >
          <p className="text-sm font-medium text-rose-800 dark:text-rose-200">
            Tasks couldn’t be loaded.
          </p>
          <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
            Your tasks have not been changed. Try again in a moment.
          </p>
          <Link
            href={`/projects/${projectId}/tasks?view=${view}`}
            className="mt-2 inline-block text-sm font-medium text-rose-800 underline underline-offset-2 dark:text-rose-200"
          >
            Retry
          </Link>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface px-5 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No tasks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a task to start tracking work in this project.
          </p>
        </div>
      ) : view === "table" ? (
        <TaskTable tasks={tasks} projectId={projectId} filters={filters} />
      ) : (
        <TaskKanban tasks={tasks} projectId={projectId} />
      )}
    </div>
  );
}
