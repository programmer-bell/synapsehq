"use client";

import { useActionState } from "react";

import { updateTaskAction } from "../actions/task-actions";
import type { TaskFormState } from "../types";

type UpdateTaskFormProps = {
  taskId: string;
  projectId: string;
  initialTitle: string;
  initialDescription: string | null;
  initialStatus: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  initialPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  initialAssigneeId: string | null;
  initialDueDate: string | null;
  assignableUsers: { id: string; name: string; email: string }[];
};

export function UpdateTaskForm({
  taskId,
  projectId,
  initialTitle,
  initialDescription,
  initialStatus,
  initialPriority,
  initialAssigneeId,
  initialDueDate,
  assignableUsers,
}: UpdateTaskFormProps) {
  const action = updateTaskAction.bind(null, taskId);
  const [state, formAction, isPending] = useActionState<
    TaskFormState,
    FormData
  >(action, { status: "idle" });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      {state.message ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2">
        <label
          htmlFor="task-update-title"
          className="block text-sm font-medium text-foreground"
        >
          Title
        </label>
        <input
          id="task-update-title"
          name="title"
          defaultValue={initialTitle}
          required
          minLength={2}
          maxLength={160}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {state.fieldErrors?.title?.[0] ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.fieldErrors.title[0]}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label
          htmlFor="task-update-description"
          className="block text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id="task-update-description"
          name="description"
          defaultValue={initialDescription ?? ""}
          rows={3}
          maxLength={4000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="task-update-status"
            className="block text-sm font-medium text-foreground"
          >
            Status
          </label>
          <select
            id="task-update-status"
            name="status"
            defaultValue={initialStatus}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="IN_REVIEW">In review</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="task-update-priority"
            className="block text-sm font-medium text-foreground"
          >
            Priority
          </label>
          <select
            id="task-update-priority"
            name="priority"
            defaultValue={initialPriority}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="task-update-assignee"
            className="block text-sm font-medium text-foreground"
          >
            Assignee
          </label>
          <select
            id="task-update-assignee"
            name="assigneeId"
            defaultValue={initialAssigneeId ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="">Unassigned</option>
            {assignableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="task-update-due-date"
            className="block text-sm font-medium text-foreground"
          >
            Due date
          </label>
          <input
            id="task-update-due-date"
            name="dueDate"
            type="date"
            defaultValue={initialDueDate ? initialDueDate.slice(0, 10) : ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
