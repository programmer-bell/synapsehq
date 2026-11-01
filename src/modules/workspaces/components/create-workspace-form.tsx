"use client";

import { Building2 } from "lucide-react";
import { useActionState, useEffect } from "react";

import {
  FormAlert,
  fieldErrorClass,
  inputClass,
  labelClass,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createWorkspaceAction } from "../actions/workspace-actions";
import type { WorkspaceFormState } from "../types";

const initialState: WorkspaceFormState = { status: "idle" };

export function CreateWorkspaceForm() {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(
    createWorkspaceAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast({
        title: "Workspace created",
        description: state.message ?? "Your workspace is ready.",
        variant: "success",
      });
    } else if (state.status === "error" && state.message) {
      toast({
        title: "Could not create workspace",
        description: state.message,
        variant: "error",
      });
    }
  }, [state.status, state.message, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert status={state.status} message={state.message} />
      <div className="space-y-1.5">
        <label htmlFor="workspace-name" className={labelClass}>
          Workspace name <span className="text-rose-500">*</span>
        </label>
        <input
          id="workspace-name"
          name="name"
          required
          minLength={2}
          maxLength={120}
          className={inputClass}
          placeholder="Engineering Platform"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className={fieldErrorClass}>{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <Button type="submit" size="md" loading={isPending} className="h-10 px-4">
        <Building2 aria-hidden="true" className="size-4" />
        {isPending ? "Creating..." : "Create workspace"}
      </Button>
    </form>
  );
}
