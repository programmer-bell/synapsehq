"use client";

import { FolderPlus } from "lucide-react";
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
import { createProjectAction } from "../actions/project-actions";
import type { ProjectFormState } from "../types";

type CreateProjectFormProps = {
  workspaceId: string;
  onSuccess?: () => void;
};

export function CreateProjectForm({ workspaceId }: CreateProjectFormProps) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState<
    ProjectFormState,
    FormData
  >(createProjectAction, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      toast({
        title: "Project created",
        description: state.message ?? "Your project is ready.",
        variant: "success",
      });
    } else if (state.status === "error" && state.message) {
      toast({
        title: "Could not create project",
        description: state.message,
        variant: "error",
      });
    }
  }, [state.status, state.message, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <FormAlert status={state.status} message={state.message} />
      <div className="space-y-1.5">
        <label htmlFor="project-name" className={labelClass}>
          Project name <span className="text-rose-500">*</span>
        </label>
        <input
          id="project-name"
          name="name"
          required
          minLength={2}
          maxLength={120}
          className={inputClass}
          placeholder="API Gateway"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className={fieldErrorClass}>{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="project-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="project-description"
          name="description"
          rows={3}
          maxLength={2000}
          className={inputClass}
          placeholder="What is this project delivering?"
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className={fieldErrorClass}>{state.fieldErrors.description[0]}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="project-status" className={labelClass}>
          Status
        </label>
        <select
          id="project-status"
          name="status"
          defaultValue="ACTIVE"
          className={selectClass}
        >
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div className="flex justify-end border-t border-border pt-3">
        <Button
          type="submit"
          size="md"
          loading={isPending}
          className="h-10 px-4"
        >
          <FolderPlus aria-hidden="true" className="size-4" />
          {isPending ? "Creating..." : "Create project"}
        </Button>
      </div>
    </form>
  );
}
