import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Columns3,
  ListChecks,
  ListTodo,
  Settings,
  Sparkles,
  Table2,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
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

export default function ProjectTasksPage({
  params,
  searchParams,
}: TasksPageProps) {
  return (
    <Suspense fallback={<ProjectTasksPageFallback />}>
      <ProjectTasksContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ProjectTasksContent({ params, searchParams }: TasksPageProps) {
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
  const openCreateDialog = firstValue(rawSearchParams.new) === "1";

  const [tasksResult, assignableResult, projectMilestones] = await Promise.all([
    listTasksForProject(user.id, projectId, filters),
    listAssignableUsers(user.id, projectId),
    getProjectMilestones(user.id, projectId),
  ]);

  const tasks = tasksResult.ok ? tasksResult.data : [];
  const assignableUsers = assignableResult.ok ? assignableResult.data : [];

  const viewParams = (targetView: "kanban" | "table") =>
    new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [key, String(value)]),
      ),
      view: targetView,
    }).toString();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={access.project.name}
        title="Tasks"
        description="Keep the team aligned and work moving forward."
        icon={<ListChecks aria-hidden="true" />}
        actions={
          <>
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:text-accent active:scale-[0.98]"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Project
            </Link>
            <CreateTaskDialog
              projectId={projectId}
              defaultOpen={openCreateDialog}
              assignableUsers={assignableUsers}
              milestones={
                projectMilestones?.milestones.map(({ id, name }) => ({
                  id,
                  name,
                })) ?? []
              }
            />
          </>
        }
      />

      <TaskFilters
        projectId={projectId}
        filters={filters}
        view={view}
        assignableUsers={assignableUsers}
      />

      {actionError === "task-status-update" || actionError === "task-delete" ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-300"
        >
          <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
          <span>
            {actionError === "task-status-update"
              ? "We couldn’t update the task status. Please try again."
              : "We couldn’t delete the task. Please try again."}
          </span>
          <Link
            href={`/projects/${projectId}/tasks?view=${view}`}
            className="ml-auto text-xs font-semibold underline underline-offset-2"
          >
            Dismiss
          </Link>
        </div>
      ) : null}

      {!assignableResult.ok ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-800 dark:text-amber-200"
        >
          <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
          Assignee options are temporarily unavailable. You can still create
          unassigned tasks.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
          <Link
            href={`/projects/${projectId}/tasks?${viewParams("kanban")}`}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all duration-200 ${
              view === "kanban"
                ? "bg-accent/12 text-accent shadow-sm"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            <Columns3 aria-hidden="true" className="size-3.5" />
            Kanban
          </Link>
          <Link
            href={`/projects/${projectId}/tasks?${viewParams("table")}`}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all duration-200 ${
              view === "table"
                ? "bg-accent/12 text-accent shadow-sm"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            <Table2 aria-hidden="true" className="size-3.5" />
            Table
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {tasksResult.ok ? (
            <Badge variant="outline" className="tabular-nums">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </Badge>
          ) : (
            <Badge variant="danger" dot>
              Tasks unavailable
            </Badge>
          )}
          <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
            <Sparkles aria-hidden="true" className="size-3 text-accent" />
            Tip: drag cards between columns to update status
          </span>
        </div>
      </div>

      {!tasksResult.ok ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4"
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-rose-800 dark:text-rose-200">
            <AlertCircle aria-hidden="true" className="size-4" />
            Tasks couldn’t be loaded.
          </p>
          <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
            Your tasks have not been changed. Try again in a moment.
          </p>
          <Link
            href={`/projects/${projectId}/tasks?view=${view}`}
            className="mt-2 inline-block text-sm font-semibold text-rose-800 underline underline-offset-2 dark:text-rose-200"
          >
            Retry
          </Link>
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<ListTodo aria-hidden="true" />}
          title="No tasks yet"
          description="Create a task to start tracking work, or adjust the filters to see existing tasks."
          action={
            <Link
              href={`/projects/${projectId}/tasks?view=${view}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:text-accent active:scale-[0.98]"
            >
              <Settings aria-hidden="true" className="size-4" />
              Reset filters
            </Link>
          }
        />
      ) : view === "table" ? (
        <TaskTable tasks={tasks} projectId={projectId} filters={filters} />
      ) : (
        <TaskKanban tasks={tasks} projectId={projectId} />
      )}
    </div>
  );
}

function ProjectTasksPageFallback() {
  return (
    <div className="space-y-5" aria-label="Loading project tasks">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
          <div className="h-7 w-32 animate-pulse rounded bg-surface-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-surface-muted/70" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 animate-pulse rounded-lg border border-border bg-card" />
          <div className="h-9 w-32 animate-pulse rounded-lg bg-accent/70" />
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <div className="h-10 w-full animate-pulse rounded-lg border border-border bg-card sm:w-96" />
        <div className="h-8 w-40 animate-pulse rounded-lg bg-surface-muted" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {["todo", "progress", "review", "done"].map((column) => (
          <section
            key={column}
            className="min-h-64 space-y-3 rounded-xl border border-border bg-surface-muted/30 p-3"
          >
            <div className="h-5 w-28 animate-pulse rounded bg-surface-muted" />
            {["first", "second"].map((card) => (
              <div
                key={`${column}-${card}`}
                className="h-24 animate-pulse rounded-lg border border-border bg-card"
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
