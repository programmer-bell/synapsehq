"use client";

import { useActionState } from "react";

import { createProjectAction } from "../actions/project-actions";
import type { ProjectFormState } from "../types";

type CreateProjectFormProps = {
  workspaceId: string;
  onSuccess?: () => void;
};

export function CreateProjectForm({ workspaceId }: CreateProjectFormProps) {
  const [state, formAction, isPending] = useActionState<ProjectFormState, FormData>(
    createProjectAction,
    { status: "idle" },
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      {state.message ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="project-name" className="block text-sm font-medium text-foreground">
          Project name
        </label>
        <input
          id="project-name"
          name="name"
          required
          minLength={2}
          maxLength={120}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="API Gateway"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="project-description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="project-description"
          name="description"
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.fieldErrors.description[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="project-status" className="block text-sm font-medium text-foreground">
          Status
        </label>
        <select
          id="project-status"
          name="status"
          defaultValue="ACTIVE"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}