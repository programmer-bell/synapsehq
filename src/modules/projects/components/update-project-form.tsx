"use client";

import { Save } from "lucide-react";
import { useActionState, useEffect } from "react";

import {
  FormAlert,
  fieldErrorClass,
  inputClass,
  labelClass,
  selectClass,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
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
  const { toast } = useToast();
  const action = updateProjectAction.bind(null, projectId);
  const [state, formAction, isPending] = useActionState<
    ProjectFormState,
    FormData
  >(action, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      toast({
        title: "Project updated",
        description: state.message ?? "Your changes have been saved.",
        variant: "success",
      });
    } else if (state.status === "error" && state.message) {
      toast({
        title: "Could not update project",
        description: state.message,
        variant: "error",
      });
    }
  }, [state.status, state.message, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert status={state.status} message={state.message} />
      <div className="space-y-1.5">
        <label htmlFor="project-update-name" className={labelClass}>
          Project name <span className="text-rose-500">*</span>
        </label>
        <input
          id="project-update-name"
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
      <div className="space-y-1.5">
        <label htmlFor="project-update-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="project-update-description"
          name="description"
          defaultValue={initialDescription ?? ""}
          rows={3}
          maxLength={2000}
          className={inputClass}
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className={fieldErrorClass}>{state.fieldErrors.description[0]}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="project-update-status" className={labelClass}>
          Status
        </label>
        <select
          id="project-update-status"
          name="status"
          defaultValue={initialStatus}
          className={selectClass}
        >
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <Button type="submit" size="md" loading={isPending} className="h-10 px-4">
        <Save aria-hidden="true" className="size-4" />
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
