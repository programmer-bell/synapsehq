"use client";

import { useActionState } from "react";

import { createWorkspaceAction } from "../actions/workspace-actions";
import type { WorkspaceFormState } from "../types";

const initialState: WorkspaceFormState = { status: "idle" };

export function CreateWorkspaceForm() {
  const [state, formAction, isPending] = useActionState(
    createWorkspaceAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="workspace-name" className="block text-sm font-medium text-foreground">
          Workspace name
        </label>
        <input
          id="workspace-name"
          name="name"
          required
          minLength={2}
          maxLength={120}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Engineering Platform"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating..." : "Create workspace"}
      </button>
    </form>
  );
}