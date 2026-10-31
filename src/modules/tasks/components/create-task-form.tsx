"use client";

import { useActionState } from "react";

import { createTaskAction } from "../actions/task-actions";
import type { TaskFormState } from "../types";

type AssignableUser = {
  id: string;
  name: string;
  email: string;
};

type CreateTaskFormProps = {
  projectId: string;
  assignableUsers: AssignableUser[];
};

export function CreateTaskForm({
  projectId,
  assignableUsers,
}: CreateTaskFormProps) {
  const [state, formAction, isPending] = useActionState<
    TaskFormState,
    FormData
  >(createTaskAction, { status: "idle" });

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
          htmlFor="task-title"
          className="block text-sm font-medium text-foreground"
        >
          Title
        </label>
        <input
          id="task-title"
          name="title"
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
          htmlFor="task-description"
          className="block text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id="task-description"
          name="description"
          rows={3}
          maxLength={4000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="task-status"
            className="block text-sm font-medium text-foreground"
          >
            Status
          </label>
          <select
            id="task-status"
            name="status"
            defaultValue="TODO"
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
            htmlFor="task-priority"
            className="block text-sm font-medium text-foreground"
          >
            Priority
          </label>
          <select
            id="task-priority"
            name="priority"
            defaultValue="MEDIUM"
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
            htmlFor="task-assignee"
            className="block text-sm font-medium text-foreground"
          >
            Assignee
          </label>
          <select
            id="task-assignee"
            name="assigneeId"
            defaultValue=""
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
            htmlFor="task-due-date"
            className="block text-sm font-medium text-foreground"
          >
            Due date
          </label>
          <input
            id="task-due-date"
            name="dueDate"
            type="date"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating..." : "Create task"}
      </button>
    </form>
  );
}
