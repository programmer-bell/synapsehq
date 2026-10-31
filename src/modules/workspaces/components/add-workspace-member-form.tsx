"use client";

import { useActionState } from "react";

import { addWorkspaceMemberAction } from "../actions/workspace-actions";
import type { WorkspaceMemberActionState } from "../types";

type AddWorkspaceMemberFormProps = {
  workspaceId: string;
};

export function AddWorkspaceMemberForm({
  workspaceId,
}: AddWorkspaceMemberFormProps) {
  const action = addWorkspaceMemberAction.bind(null, workspaceId);
  const [state, formAction, isPending] = useActionState<
    WorkspaceMemberActionState,
    FormData
  >(action, { status: "idle" });

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-2">
        <label
          htmlFor="member-email"
          className="block text-sm font-medium text-foreground"
        >
          Member email
        </label>
        <input
          id="member-email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="teammate@example.com"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="member-role"
          className="block text-sm font-medium text-foreground"
        >
          Role
        </label>
        <select
          id="member-role"
          name="role"
          defaultValue="MEMBER"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Adding..." : "Add member"}
      </button>
      {state.message ? (
        <p
          role="status"
          className="sm:basis-full text-sm text-muted-foreground"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
