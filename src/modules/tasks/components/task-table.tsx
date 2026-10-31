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

function sortLink(projectId: string, filters: TaskTableProps["filters"], sortBy: string) {
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
      filters.sortBy === sortBy && filters.sortDirection === "asc" ? "desc" : "asc",
  });

  return `/projects/${projectId}/tasks?${params.toString()}`;
}

export function TaskTable({ tasks, projectId, filters }: TaskTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-foreground">
              <Link href={sortLink(projectId, filters, "title")}>Title</Link>
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground">
              <Link href={sortLink(projectId, filters, "status")}>Status</Link>
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground">
              <Link href={sortLink(projectId, filters, "priority")}>Priority</Link>
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground">
              Assignee
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground">
              <Link href={sortLink(projectId, filters, "dueDate")}>Due date</Link>
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground">
              <Link href={sortLink(projectId, filters, "createdAt")}>Created</Link>
            </th>
            <th className="px-4 py-3 text-right font-medium text-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-surface-muted/60">
              <td className="px-4 py-3 font-medium text-foreground">
                <Link
                  href={`/projects/${projectId}/tasks/${task.id}/edit`}
                  className="hover:text-accent"
                >
                  {task.title}
                </Link>
                {task.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {task.description}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{task.status}</td>
              <td className="px-4 py-3 text-muted-foreground">{task.priority}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {task.assigneeId ?? "Unassigned"}
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {task.dueDate ? task.dueDate.toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {task.createdAt.toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/projects/${projectId}/tasks/${task.id}/edit`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}