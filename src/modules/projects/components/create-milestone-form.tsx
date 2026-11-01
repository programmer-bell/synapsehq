"use client";

import { CalendarDays, Milestone } from "lucide-react";
import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert, inputClass, labelClass } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { createProjectMilestoneAction } from "../actions/project-work-actions";

export function CreateMilestoneForm({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(
    createProjectMilestoneAction,
    {},
  );

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Could not add milestone",
        description: state.error,
        variant: "error",
      });
    }
  }, [state.error, toast]);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="space-y-1.5">
        <span className={`${labelClass} flex items-center gap-1`}>
          <Milestone aria-hidden="true" className="size-3 text-violet-500" />
          Milestone name <span className="text-rose-500">*</span>
        </span>
        <input
          name="name"
          required
          minLength={2}
          maxLength={120}
          placeholder="Beta launch"
          className={inputClass}
        />
      </label>
      <label className="space-y-1.5">
        <span className={`${labelClass} flex items-center gap-1`}>
          <CalendarDays
            aria-hidden="true"
            className="size-3 text-emerald-500"
          />
          Due date
        </span>
        <input name="dueDate" type="date" className={inputClass} />
      </label>
      <label className="space-y-1.5 sm:col-span-2">
        <span className={labelClass}>Description</span>
        <textarea
          name="description"
          maxLength={2000}
          rows={2}
          placeholder="What does success look like?"
          className={inputClass}
        />
      </label>
      {state.error ? (
        <div className="sm:col-span-2">
          <FormAlert status="error" message={state.error} />
        </div>
      ) : null}
      <Button type="submit" loading={pending} className="w-fit">
        {pending ? "Creating..." : "Add milestone"}
      </Button>
    </form>
  );
}
