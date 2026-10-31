"use client";

import { useActionState } from "react";

import { updateProjectAction } from "../actions/project-actions";
import type { ProjectFormState } from "../types";

type UpdateProjectFormProps = {
  projectId: string;
  initialName: string;
  initialDescription: string | null;
  initialStatus: "ACTIVE" | "ARCHIVED";
};

export function UpdateProjectForm({
  projectId,
  initialName,
  initialDescription,
  initialStatus,
}: UpdateProjectFormProps) {
  const action = updateProjectAction.bind(null, projectId);
  const [state, formAction, isPending] = useActionState<
    ProjectFormState,
    FormData
  >(action, { status: "idle" });

  return (
    <form action={formAction} className="space-y-4">
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
          htmlFor="project-update-name"
          className="block text-sm font-medium text-foreground"
        >
          Project name
        </label>
        <input
          id="project-update-name"
          name="name"
          defaultValue={initialName}
          required
          minLength={2}
          maxLength={120}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.fieldErrors.name[0]}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label
          htmlFor="project-update-description"
          className="block text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id="project-update-description"
          name="description"
          defaultValue={initialDescription ?? ""}
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.fieldErrors.description[0]}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label
          htmlFor="project-update-status"
          className="block text-sm font-medium text-foreground"
        >
          Status
        </label>
        <select
          id="project-update-status"
          name="status"
          defaultValue={initialStatus}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
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
