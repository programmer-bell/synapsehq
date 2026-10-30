"use client";

import { useActionState } from "react";

import { updateWorkspaceAction } from "../actions/workspace-actions";
import type { WorkspaceFormState } from "../types";

type UpdateWorkspaceFormProps = {
  workspaceId: string;
  initialName: string;
};

export function UpdateWorkspaceForm({ workspaceId, initialName }: UpdateWorkspaceFormProps) {
  const action = updateWorkspaceAction.bind(null, workspaceId);
  const [state, formAction, isPending] = useActionState<WorkspaceFormState, FormData>(
    action,
    { status: "idle" },
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="workspace-update-name" className="block text-sm font-medium text-foreground">
          Workspace name
        </label>
        <input
          id="workspace-update-name"
          name="name"
          defaultValue={initialName}
          required
          minLength={2}
          maxLength={120}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.fieldErrors.name[0]}</p>
        ) : null}
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