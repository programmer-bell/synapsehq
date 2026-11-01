"use client";

import { UserPlus } from "lucide-react";
import { useActionState, useEffect } from "react";

import {
  FormAlert,
  inputClass,
  labelClass,
  selectClass,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { addWorkspaceMemberAction } from "../actions/workspace-actions";
import type { WorkspaceMemberActionState } from "../types";

type AddWorkspaceMemberFormProps = {
  workspaceId: string;
};

export function AddWorkspaceMemberForm({
  workspaceId,
}: AddWorkspaceMemberFormProps) {
  const { toast } = useToast();
  const action = addWorkspaceMemberAction.bind(null, workspaceId);
  const [state, formAction, isPending] = useActionState<
    WorkspaceMemberActionState,
    FormData
  >(action, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      toast({
        title: "Member added",
        description: state.message ?? "They now have workspace access.",
        variant: "success",
      });
    } else if (state.status === "error" && state.message) {
      toast({
        title: "Could not add member",
        description: state.message,
        variant: "error",
      });
    }
  }, [state.status, state.message, toast]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-1.5">
        <label htmlFor="member-email" className={labelClass}>
          Member email
        </label>
        <input
          id="member-email"
          name="email"
          type="email"
          required
          className={inputClass}
          placeholder="teammate@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="member-role" className={labelClass}>
          Role
        </label>
        <select
          id="member-role"
          name="role"
          defaultValue="MEMBER"
          className={selectClass}
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <Button type="submit" loading={isPending}>
        <UserPlus aria-hidden="true" className="size-4" />
        {isPending ? "Adding..." : "Add member"}
      </Button>
      {state.message ? (
        <div className="sm:basis-full">
          <FormAlert status={state.status} message={state.message} />
        </div>
      ) : null}
    </form>
  );
}
