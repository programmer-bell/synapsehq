import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/src/modules/auth";
import { getProjectAccess } from "@/src/modules/projects";
import { listAssignableUsers, listTasksForProject } from "@/src/modules/tasks/services/task-service";
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

export default async function ProjectTasksPage({ params, searchParams }: TasksPageProps) {
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

  const filters = parsedFilters.success ? parsedFilters.data : taskFiltersSchema.parse({});
  const view = firstValue(rawSearchParams.view) === "table" ? "table" : "kanban";

  const [tasksResult, assignableResult] = await Promise.all([
    listTasksForProject(user.id, projectId, filters),
    listAssignableUsers(user.id, projectId),
  ]);

  const tasks = tasksResult.ok ? tasksResult.data : [];
  const assignableUsers = assignableResult.ok ? assignableResult.data : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Tasks</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Task board
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage work for this project across Kanban and table views.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
          >
            Project details
          </Link>
          <CreateTaskDialog projectId={projectId} assignableUsers={assignableUsers} />
        </div>
      </div>

      <TaskFilters
        projectId={projectId}
        filters={filters}
        view={view}
        assignableUsers={assignableUsers}
      />

      <div className="flex gap-2">
        <Link
          href={`/projects/${projectId}/tasks?${new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, String(value)])), view: "kanban" }).toString()}`}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${view === "kanban" ? "bg-accent text-accent-foreground" : "border border-border text-foreground hover:bg-surface-muted"}`}
        >
          Kanban
        </Link>
        <Link
          href={`/projects/${projectId}/tasks?${new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, String(value)])), view: "table" }).toString()}`}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${view === "table" ? "bg-accent text-accent-foreground" : "border border-border text-foreground hover:bg-surface-muted"}`}
        >
          Table
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8">
          <p className="text-sm font-medium text-foreground">No tasks yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
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