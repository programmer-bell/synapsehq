"use client";

import Link from "next/link";

type AssignableUser = {
  id: string;
  name: string;
  email: string;
};

type TaskFiltersProps = {
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
  view: "kanban" | "table";
  assignableUsers: AssignableUser[];
};

export function TaskFilters({
  projectId,
  filters,
  view,
  assignableUsers,
}: TaskFiltersProps) {
  return (
    <form
      method="get"
      action={`/projects/${projectId}/tasks`}
      className="rounded-2xl border border-border bg-surface p-4"
    >
      <input type="hidden" name="view" value={view} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          name="search"
          defaultValue={filters.search}
          placeholder="Search tasks"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <select
          name="status"
          defaultValue={filters.status}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="ALL">All statuses</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="IN_REVIEW">In review</option>
          <option value="DONE">Done</option>
        </select>
        <select
          name="priority"
          defaultValue={filters.priority}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="ALL">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <select
          name="assigneeId"
          defaultValue={filters.assigneeId}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="ALL">All assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {assignableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <input
          name="dueBefore"
          type="date"
          defaultValue={filters.dueBefore}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <input
          name="dueAfter"
          type="date"
          defaultValue={filters.dueAfter}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <select
          name="sortBy"
          defaultValue={filters.sortBy}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="createdAt">Created</option>
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
        </select>
        <select
          name="sortDirection"
          defaultValue={filters.sortDirection}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      <div className="mt-3 flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Apply filters
        </button>
        <Link
          href={`/projects/${projectId}/tasks?view=${view}`}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
