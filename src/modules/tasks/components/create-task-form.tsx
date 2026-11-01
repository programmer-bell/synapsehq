"use client";

import {
  CalendarDays,
  Flag,
  ListChecks,
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
import { createTaskAction } from "../actions/task-actions";
import type { TaskFormState } from "../types";

type AssignableUser = {
  id: string;
  name: string;
  email: string;
};

type CreateTaskFormProps = {
  projectId: string;
  assignableUsers: AssignableUser[];
  milestones: { id: string; name: string }[];
};

export function CreateTaskForm({
  projectId,
  assignableUsers,
  milestones,
}: CreateTaskFormProps) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState<
    TaskFormState,
    FormData
  >(createTaskAction, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      toast({
        title: "Task created",
        description: state.message ?? "Your task is ready.",
        variant: "success",
      });
    }
    if (state.status === "error" && state.message) {
      toast({
        title: "Could not create task",
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
          <div>
            <p className="text-xs font-semibold text-foreground">
              Task details
            </p>
            <p className="text-[11px] text-muted-foreground">
              Give the team a clear, actionable title.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="task-title" className={labelClass}>
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-title"
            name="title"
            required
            minLength={2}
            maxLength={160}
            placeholder="e.g. Add rate limiting to the login API"
            className={inputClass}
          />
          {state.fieldErrors?.title?.[0] ? (
            <p className={fieldErrorClass}>{state.fieldErrors.title[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="task-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="task-description"
            name="description"
            rows={3}
            maxLength={4000}
            placeholder="Add context, acceptance criteria, or links..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border/70 bg-surface-muted/25 p-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
            <Sparkles aria-hidden="true" className="size-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">
              Planning & ownership
            </p>
            <p className="text-[11px] text-muted-foreground">
              Set status, priority, milestone, and who owns the work.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="task-status" className={labelClass}>
              Status
            </label>
            <select
              id="task-status"
              name="status"
              defaultValue="TODO"
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
              htmlFor="task-priority"
              className={`${labelClass} flex items-center gap-1`}
            >
              <Flag aria-hidden="true" className="size-3 text-amber-500" />
              Priority
            </label>
            <select
              id="task-priority"
              name="priority"
              defaultValue="MEDIUM"
              className={selectClass}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="task-milestone" className={labelClass}>
              Milestone
            </label>
            <select
              id="task-milestone"
              name="milestoneId"
              defaultValue=""
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
              htmlFor="task-assignee"
              className={`${labelClass} flex items-center gap-1`}
            >
              <UserRound aria-hidden="true" className="size-3 text-sky-500" />
              Assignee
            </label>
            <select
              id="task-assignee"
              name="assigneeId"
              defaultValue=""
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
              htmlFor="task-due-date"
              className={`${labelClass} flex items-center gap-1`}
            >
              <CalendarDays
                aria-hidden="true"
                className="size-3 text-emerald-500"
              />
              Due date
            </label>
            <input
              id="task-due-date"
              name="dueDate"
              type="date"
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
          <Sparkles aria-hidden="true" className="size-4" />
          {isPending ? "Creating..." : "Create task"}
        </Button>
      </div>
    </form>
  );
}
