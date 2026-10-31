"use client";

import { useActionState } from "react";

import { createProjectMilestoneAction } from "../actions/project-work-actions";

export function CreateMilestoneForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(
    createProjectMilestoneAction,
    {},
  );

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
        Milestone name
        <input
          name="name"
          required
          minLength={2}
          maxLength={120}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
      <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
        Due date
        <input
          name="dueDate"
          type="date"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
      <label className="space-y-1.5 text-xs font-medium text-muted-foreground sm:col-span-2">
        Description
        <textarea
          name="description"
          maxLength={2000}
          rows={2}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
      >
        {pending ? "Creating..." : "Add milestone"}
      </button>
    </form>
  );
}
