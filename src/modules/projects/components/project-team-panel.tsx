"use client";

import { Gauge, UserMinus, UserPlus, Users } from "lucide-react";
import { useActionState, useEffect } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { inputClass, selectClass } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
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
  const { toast } = useToast();
  const [addState, addAction, adding] = useActionState<
    TeamActionState,
    FormData
  >(addProjectMemberAction.bind(null, projectId), { status: "idle" });
  const [removeState, removeAction, removing] = useActionState<
    TeamActionState,
    FormData
  >(removeProjectMemberAction.bind(null, projectId), { status: "idle" });

  useEffect(() => {
    if (addState.status === "success") {
      toast({
        title: "Project member added",
        description: addState.message,
        variant: "success",
      });
    } else if (addState.status === "error" && addState.message) {
      toast({
        title: "Could not add member",
        description: addState.message,
        variant: "error",
      });
    }
  }, [addState.status, addState.message, toast]);

  useEffect(() => {
    if (removeState.status === "success") {
      toast({
        title: "Project member removed",
        description: removeState.message,
        variant: "info",
      });
    } else if (removeState.status === "error" && removeState.message) {
      toast({
        title: "Could not remove member",
        description: removeState.message,
        variant: "error",
      });
    }
  }, [removeState.status, removeState.message, toast]);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
        <div className="flex items-start gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
            <Users aria-hidden="true" className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Project team
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Set each workspace member&apos;s planned project allocation.
            </p>
          </div>
        </div>
        <Badge variant="violet">
          {members.length} {members.length === 1 ? "member" : "members"}
        </Badge>
      </div>

      <div className="p-4">
        {members.length ? (
          <ul className="divide-y divide-border/70">
            {members.map((member) => (
              <li key={member.id} className="flex items-center gap-3 py-2.5">
                <Avatar name={member.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {member.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <div className="hidden w-28 shrink-0 sm:block">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Gauge aria-hidden="true" className="size-3" />
                      Allocation
                    </span>
                    <span className="font-medium text-foreground">
                      {member.allocationPercent}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                      style={{ width: `${member.allocationPercent}%` }}
                    />
                  </div>
                </div>
                {canManage ? (
                  <form action={removeAction}>
                    <input type="hidden" name="userId" value={member.userId} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      loading={removing}
                      aria-label={`Remove ${member.name}`}
                      className="size-7 rounded-md text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300"
                    >
                      <UserMinus aria-hidden="true" className="size-3.5" />
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-surface-muted/20 px-3 py-5 text-center text-xs text-muted-foreground">
            No project members assigned yet.
          </p>
        )}

        {canManage ? (
          <form
            action={addAction}
            className="mt-4 flex flex-wrap items-end gap-2 rounded-lg border border-border/70 bg-surface-muted/25 p-2.5"
          >
            <label className="min-w-48 flex-1 space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Workspace member
              </span>
              <select
                name="userId"
                required
                defaultValue=""
                className={selectClass}
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
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Allocation
              </span>
              <span className="flex items-center gap-1">
                <input
                  name="allocationPercent"
                  type="number"
                  min={1}
                  max={100}
                  defaultValue={100}
                  className={`${inputClass} w-20`}
                />
                <span className="text-xs text-muted-foreground">%</span>
              </span>
            </label>
            <Button
              type="submit"
              loading={adding}
              disabled={candidates.length === 0}
            >
              <UserPlus aria-hidden="true" className="size-4" />
              {adding ? "Adding..." : "Add member"}
            </Button>
          </form>
        ) : null}

        {[addState, removeState].map((state, index) =>
          state.message ? (
            <p
              key={index}
              role={state.status === "error" ? "alert" : "status"}
              className={`mt-3 text-xs ${state.status === "error" ? "text-rose-600 dark:text-rose-300" : "text-emerald-600 dark:text-emerald-300"}`}
            >
              {state.message}
            </p>
          ) : null,
        )}
      </div>
    </section>
  );
}
