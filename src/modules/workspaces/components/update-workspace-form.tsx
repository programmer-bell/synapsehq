"use client";

import { Save } from "lucide-react";
import { useActionState, useEffect } from "react";

import {
  FormAlert,
  fieldErrorClass,
  inputClass,
  labelClass,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { updateWorkspaceAction } from "../actions/workspace-actions";
import type { WorkspaceFormState } from "../types";

type UpdateWorkspaceFormProps = {
  workspaceId: string;
  initialName: string;
};

export function UpdateWorkspaceForm({
  workspaceId,
  initialName,
}: UpdateWorkspaceFormProps) {
  const { toast } = useToast();
  const action = updateWorkspaceAction.bind(null, workspaceId);
  const [state, formAction, isPending] = useActionState<
    WorkspaceFormState,
    FormData
  >(action, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      toast({
        title: "Workspace updated",
        description: state.message ?? "Your changes have been saved.",
        variant: "success",
      });
    } else if (state.status === "error" && state.message) {
      toast({
        title: "Could not update workspace",
        description: state.message,
        variant: "error",
      });
    }
  }, [state.status, state.message, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert status={state.status} message={state.message} />
      <div className="space-y-1.5">
        <label htmlFor="workspace-update-name" className={labelClass}>
          Workspace name <span className="text-rose-500">*</span>
        </label>
        <input
          id="workspace-update-name"
          name="name"
          defaultValue={initialName}
          required
          minLength={2}
          maxLength={120}
          className={inputClass}
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className={fieldErrorClass}>{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <Button type="submit" size="md" loading={isPending} className="h-10 px-4">
        <Save aria-hidden="true" className="size-4" />
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
