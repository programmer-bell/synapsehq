import Link from "next/link";

import { updateTaskStatusAction } from "../actions/task-actions";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId: string | null;
  dueDate: Date | null;
};

const columns: { status: Task["status"]; label: string }[] = [
  { status: "TODO", label: "To do" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "IN_REVIEW", label: "In review" },
  { status: "DONE", label: "Done" },
];

export function TaskKanban({
  tasks,
  projectId,
}: {
  tasks: Task[];
  projectId: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column.status,
        );

        return (
          <section
            key={column.status}
            className="rounded-md border border-border bg-surface p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {column.label}
              </h2>
              <span className="rounded border border-border px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                {columnTasks.length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {columnTasks.length === 0 ? (
                <p className="rounded-md border border-dashed border-border bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                  No tasks
                </p>
              ) : (
                columnTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-md border border-border bg-background p-3.5 transition-colors duration-150 hover:border-accent/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/projects/${projectId}/tasks/${task.id}`}
                        className="text-sm font-medium text-foreground hover:text-accent"
                      >
                        {task.title}
                      </Link>
                      <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {task.priority}
                      </span>
                    </div>
                    {task.description ? (
                      <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {columns
                        .filter((target) => target.status !== task.status)
                        .map((target) => (
                          <form
                            key={target.status}
                            action={updateTaskStatusAction.bind(null, task.id)}
                          >
                            <input
                              type="hidden"
                              name="projectId"
                              value={projectId}
                            />
                            <input
                              type="hidden"
                              name="status"
                              value={target.status}
                            />
                            <button
                              type="submit"
                              className="rounded border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-surface-muted hover:text-foreground"
                            >
                              {target.label}
                            </button>
                          </form>
                        ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
