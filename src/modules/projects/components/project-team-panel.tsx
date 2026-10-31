"use client";

import { useActionState } from "react";

import {
  addProjectMemberAction,
  removeProjectMemberAction,
} from "../actions/project-work-actions";

type TeamActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

type TeamMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  allocationPercent: number;
};

export function ProjectTeamPanel({
  projectId,
  members,
  candidates,
  canManage,
}: {
  projectId: string;
  members: TeamMember[];
  candidates: { id: string; name: string; email: string }[];
  canManage: boolean;
}) {
  const [addState, addAction, adding] = useActionState<
    TeamActionState,
    FormData
  >(addProjectMemberAction.bind(null, projectId), { status: "idle" });
  const [removeState, removeAction, removing] = useActionState<
    TeamActionState,
    FormData
  >(removeProjectMemberAction.bind(null, projectId), { status: "idle" });

  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Project team
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Set each workspace member&apos;s planned project allocation.
          </p>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </div>
      {members.length ? (
        <ul className="mt-3 divide-y divide-border">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {member.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email} · {member.allocationPercent}% allocation
                </p>
              </div>
              {canManage ? (
                <form action={removeAction}>
                  <input type="hidden" name="userId" value={member.userId} />
                  <button
                    type="submit"
                    disabled={removing}
                    className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-surface-muted disabled:opacity-50"
                  >
                    Remove
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          No project members assigned yet.
        </p>
      )}
      {canManage ? (
        <form action={addAction} className="mt-4 flex flex-wrap gap-2">
          <select
            name="userId"
            required
            defaultValue=""
            className="min-w-48 flex-1 rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground"
          >
            <option value="" disabled>
              Select workspace member
            </option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-md border border-border px-2.5 text-xs text-muted-foreground">
            Allocation
            <input
              name="allocationPercent"
              type="number"
              min={1}
              max={100}
              defaultValue={100}
              className="w-14 bg-transparent py-2 text-sm text-foreground outline-none"
            />
            %
          </label>
          <button
            type="submit"
            disabled={adding || candidates.length === 0}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add member"}
          </button>
        </form>
      ) : null}
      {[addState, removeState].map((state, index) =>
        state.message ? (
          <p
            key={index}
            role={state.status === "error" ? "alert" : "status"}
            className={`mt-3 text-xs ${state.status === "error" ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}
          >
            {state.message}
          </p>
        ) : null,
      )}
    </section>
  );
}
