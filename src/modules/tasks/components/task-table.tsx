import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId: string | null;
  dueDate: Date | null;
  createdAt: Date;
};

type TaskTableProps = {
  tasks: Task[];
  projectId: string;
  filters: {
    search: string;
    status: string;
    priority: string;
    assigneeId: string;
    dueBefore: string;
    dueAfter: string;
    sortBy: string;
    sortDirection: string;
    page: number;
    pageSize: number;
  };
};

function sortLink(
  projectId: string,
  filters: TaskTableProps["filters"],
  sortBy: string,
) {
  const params = new URLSearchParams({
    view: "table",
    search: filters.search,
    status: filters.status,
    priority: filters.priority,
    assigneeId: filters.assigneeId,
    dueBefore: filters.dueBefore,
    dueAfter: filters.dueAfter,
    pageSize: String(filters.pageSize),
    page: String(filters.page),
    sortBy,
    sortDirection:
      filters.sortBy === sortBy && filters.sortDirection === "asc"
        ? "desc"
        : "asc",
  });

  return `/projects/${projectId}/tasks?${params.toString()}`;
}

function statusStyle(status: Task["status"]) {
  switch (status) {
    case "DONE":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    case "IN_REVIEW":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300";
    default:
      return "bg-surface-muted text-muted-foreground";
  }
}

function priorityStyle(priority: Task["priority"]) {
  if (priority === "URGENT" || priority === "HIGH") {
    return "text-rose-700 dark:text-rose-300";
  }
  if (priority === "MEDIUM") return "text-amber-700 dark:text-amber-300";
  return "text-muted-foreground";
}

function readableLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function TaskTable({ tasks, projectId, filters }: TaskTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-surface">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-muted/70">
          <tr>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Link href={sortLink(projectId, filters, "title")}>Title</Link>
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Link href={sortLink(projectId, filters, "status")}>Status</Link>
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Link href={sortLink(projectId, filters, "priority")}>
                Priority
              </Link>
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Assignee
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Link href={sortLink(projectId, filters, "dueDate")}>
                Due date
              </Link>
            </th>
            <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="transition-colors duration-150 hover:bg-surface-muted/50"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                <Link
                  href={`/projects/${projectId}/tasks/${task.id}`}
                  className="transition-colors hover:text-accent"
                >
                  {task.title}
                </Link>
                {task.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {task.description}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusStyle(task.status)}`}
                >
                  {readableLabel(task.status)}
                </span>
              </td>
              <td
                className={`px-4 py-3 text-xs font-medium ${priorityStyle(task.priority)}`}
              >
                {readableLabel(task.priority)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {task.assigneeId ? "Assigned" : "Unassigned"}
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {task.dueDate ? task.dueDate.toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/projects/${projectId}/tasks/${task.id}`}
                  className="rounded px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
