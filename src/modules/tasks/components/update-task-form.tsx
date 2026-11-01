"use client";

import {
  CalendarDays,
  Flag,
  ListChecks,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";
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
import { updateTaskAction } from "../actions/task-actions";
import type { TaskFormState } from "../types";

type UpdateTaskFormProps = {
  taskId: string;
  projectId: string;
  initialTitle: string;
  initialDescription: string | null;
  initialStatus: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  initialPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  initialAssigneeId: string | null;
  initialDueDate: string | null;
  initialMilestoneId: string | null;
  assignableUsers: { id: string; name: string; email: string }[];
  milestones: { id: string; name: string }[];
};

export function UpdateTaskForm({
  taskId,
  projectId,
  initialTitle,
  initialDescription,
  initialStatus,
  initialPriority,
  initialAssigneeId,
  initialDueDate,
  initialMilestoneId,
  assignableUsers,
  milestones,
}: UpdateTaskFormProps) {
  const { toast } = useToast();
  const action = updateTaskAction.bind(null, taskId);
  const [state, formAction, isPending] = useActionState<
    TaskFormState,
    FormData
  >(action, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      toast({
        title: "Task updated",
        description: state.message ?? "Your changes have been saved.",
        variant: "success",
      });
    }
    if (state.status === "error" && state.message) {
      toast({
        title: "Could not update task",
        description: state.message,
        variant: "error",
      });
    }
  }, [state.status, state.message, toast]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="projectId" value={projectId} />
      <FormAlert status={state.status} message={state.message} />

      <div className="space-y-3 rounded-xl border border-border/70 bg-surface-muted/25 p-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <ListChecks aria-hidden="true" className="size-3.5" />
          </span>
          <p className="text-xs font-semibold text-foreground">Task details</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="task-update-title" className={labelClass}>
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-update-title"
            name="title"
            defaultValue={initialTitle}
            required
            minLength={2}
            maxLength={160}
            className={inputClass}
          />
          {state.fieldErrors?.title?.[0] ? (
            <p className={fieldErrorClass}>{state.fieldErrors.title[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="task-update-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="task-update-description"
            name="description"
            defaultValue={initialDescription ?? ""}
            rows={4}
            maxLength={4000}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border/70 bg-surface-muted/25 p-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
            <Sparkles aria-hidden="true" className="size-3.5" />
          </span>
          <p className="text-xs font-semibold text-foreground">
            Planning & ownership
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="task-update-status" className={labelClass}>
              Status
            </label>
            <select
              id="task-update-status"
              name="status"
              defaultValue={initialStatus}
              className={selectClass}
            >
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="IN_REVIEW">In review</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="task-update-priority"
              className={`${labelClass} flex items-center gap-1`}
            >
              <Flag aria-hidden="true" className="size-3 text-amber-500" />
              Priority
            </label>
            <select
              id="task-update-priority"
              name="priority"
              defaultValue={initialPriority}
              className={selectClass}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="task-update-milestone" className={labelClass}>
              Milestone
            </label>
            <select
              id="task-update-milestone"
              name="milestoneId"
              defaultValue={initialMilestoneId ?? ""}
              className={selectClass}
            >
              <option value="">No milestone</option>
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="task-update-assignee"
              className={`${labelClass} flex items-center gap-1`}
            >
              <UserRound aria-hidden="true" className="size-3 text-sky-500" />
              Assignee
            </label>
            <select
              id="task-update-assignee"
              name="assigneeId"
              defaultValue={initialAssigneeId ?? ""}
              className={selectClass}
            >
              <option value="">Unassigned</option>
              {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="task-update-due-date"
              className={`${labelClass} flex items-center gap-1`}
            >
              <CalendarDays
                aria-hidden="true"
                className="size-3 text-emerald-500"
              />
              Due date
            </label>
            <input
              id="task-update-due-date"
              name="dueDate"
              type="date"
              defaultValue={initialDueDate ? initialDueDate.slice(0, 10) : ""}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        <Button
          type="submit"
          size="md"
          loading={isPending}
          className="h-10 px-4"
        >
          <Save aria-hidden="true" className="size-4" />
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
