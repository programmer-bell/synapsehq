"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleDot,
  Flag,
  ListChecks,
  Loader2,
  MessageSquare,
  Paperclip,
  Plus,
  UserRound,
} from "lucide-react";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, priorityVariant, statusVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert, inputClass } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/src/shared/lib/cn";
import {
  createTaskSubtaskAction,
  getTaskPreviewAction,
} from "../actions/task-collaboration-actions";
import {
  updateTaskAction,
  updateTaskStatusAction,
} from "../actions/task-actions";
import type { TaskFormState, TaskPriority, TaskStatus } from "../types";

type PreviewTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: Date | null;
  milestoneId?: string | null;
};

type PreviewSubtask = {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeId: string | null;
};

type SubtaskFormState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const statuses: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "DONE", label: "Done" },
];

const priorities: { value: TaskPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

function readableLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function tagClass(selected: boolean) {
  return cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55",
    selected
      ? "border-accent/40 bg-accent/12 text-accent shadow-sm"
      : "border-border bg-card text-muted-foreground hover:border-accent/30 hover:bg-accent/5 hover:text-accent",
  );
}

export function TaskPreviewSheet({
  task,
  projectId,
  open,
  onOpenChange,
}: {
  task: PreviewTask | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [details, setDetails] = useState<PreviewTask | null>(null);
  const [subtasks, setSubtasks] = useState<PreviewSubtask[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const taskId = task?.id ?? "";

  const refreshPreview = useCallback(async () => {
    if (!taskId) return;
    const data = await getTaskPreviewAction(taskId);
    if (!data) return;
    setDetails(data.task);
    setSubtasks(data.subtasks);
    setLoadedFor(taskId);
  }, [taskId]);

  useEffect(() => {
    if (!open || !taskId) return;
    let cancelled = false;
    void getTaskPreviewAction(taskId)
      .then((data) => {
        if (cancelled || !data) return;
        setDetails(data.task);
        setSubtasks(data.subtasks);
        setLoadedFor(taskId);
      })
      .catch(() => {
        if (!cancelled) setLoadedFor(taskId);
      });
    return () => {
      cancelled = true;
    };
  }, [open, taskId]);

  const subtaskFormAction = useCallback(
    async (previous: SubtaskFormState, formData: FormData) => {
      const result = await createTaskSubtaskAction(taskId, previous, formData);
      if (result.status === "success") {
        formRef.current?.reset();
        await refreshPreview();
        toast({
          title: "Subtask added",
          description: result.message ?? "Checklist updated.",
          variant: "success",
        });
      }
      if (result.status === "error" && result.message) {
        toast({
          title: "Could not add subtask",
          description: result.message,
          variant: "error",
        });
      }
      return result;
    },
    [refreshPreview, taskId, toast],
  );

  const [subtaskState, subtaskAction, subtaskPending] = useActionState<
    SubtaskFormState,
    FormData
  >(subtaskFormAction, { status: "idle" });

  if (!task) return null;

  const current = details ?? task;
  const loaded = loadedFor === task.id;
  const doneSubtasks = subtasks.filter(
    (subtask) => subtask.status === "DONE",
  ).length;
  const progress = subtasks.length
    ? Math.round((doneSubtasks / subtasks.length) * 100)
    : 0;

  function changeStatus(status: TaskStatus) {
    if (!task || current.status === status) return;
    setDetails({ ...current, status });
    startTransition(async () => {
      const formData = new FormData();
      formData.set("projectId", projectId);
      formData.set("status", status);
      await updateTaskStatusAction(task.id, formData);
      toast({
        title: "Status updated",
        description: `Moved to ${readableLabel(status)}.`,
        variant: "success",
      });
    });
  }

  function changePriority(priority: TaskPriority) {
    if (!task || !details || details.priority === priority) return;
    const previous = details;
    setDetails({ ...details, priority });
    startTransition(async () => {
      const formData = new FormData();
      formData.set("projectId", projectId);
      formData.set("title", details.title);
      formData.set("description", details.description ?? "");
      formData.set("status", details.status);
      formData.set("priority", priority);
      formData.set("assigneeId", details.assigneeId ?? "");
      formData.set("milestoneId", details.milestoneId ?? "");
      formData.set(
        "dueDate",
        details.dueDate
          ? new Date(details.dueDate).toISOString().slice(0, 10)
          : "",
      );
      const result = await updateTaskAction(
        task.id,
        {
          status: "idle",
        } as TaskFormState,
        formData,
      );
      if (result.status === "error") {
        setDetails(previous);
        toast({
          title: "Could not update priority",
          description: result.message ?? "Please try again.",
          variant: "error",
        });
        return;
      }
      toast({
        title: "Priority updated",
        description: `Labeled as ${readableLabel(priority)}.`,
        variant: "success",
      });
    });
  }

  function toggleSubtask(subtask: PreviewSubtask) {
    const nextStatus: TaskStatus = subtask.status === "DONE" ? "TODO" : "DONE";
    setSubtasks((currentSubtasks) =>
      currentSubtasks.map((item) =>
        item.id === subtask.id ? { ...item, status: nextStatus } : item,
      ),
    );
    startTransition(async () => {
      const formData = new FormData();
      formData.set("projectId", projectId);
      formData.set("status", nextStatus);
      await updateTaskStatusAction(subtask.id, formData);
      toast({
        title: nextStatus === "DONE" ? "Subtask completed" : "Subtask reopened",
        description: subtask.title,
        variant: "success",
        duration: 2400,
      });
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={task.title}
      description="Quick task preview"
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">
            Changes sync automatically.
          </span>
          <Link
            href={`/projects/${projectId}/tasks/${task.id}`}
            onClick={() => onOpenChange(false)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 active:scale-[0.98]"
          >
            Open full task
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant(current.status)} dot>
            {readableLabel(current.status)}
          </Badge>
          <Badge variant={priorityVariant(current.priority)} dot>
            {readableLabel(current.priority)} priority
          </Badge>
          {current.dueDate ? (
            <Badge variant="outline">
              <CalendarDays aria-hidden="true" className="size-3" />
              {new Date(current.dueDate).toLocaleDateString()}
            </Badge>
          ) : null}
        </div>

        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <CircleDot aria-hidden="true" className="size-3.5" />
            Description
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {current.description || "No description has been added yet."}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-surface-muted/40 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <UserRound aria-hidden="true" className="size-3" />
              Assignee
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Avatar
                name={current.assigneeId ? "Assigned member" : "Unassigned"}
                size="xs"
              />
              <span className="truncate text-xs font-medium text-foreground">
                {current.assigneeId ? "Assigned member" : "Unassigned"}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface-muted/40 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <CalendarDays aria-hidden="true" className="size-3" />
              Due date
            </p>
            <p className="mt-2 text-xs font-medium text-foreground">
              {current.dueDate
                ? new Date(current.dueDate).toLocaleDateString()
                : "No due date"}
            </p>
          </div>
        </section>

        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Flag aria-hidden="true" className="size-3.5" />
            Labels & tags
          </h3>
          <div className="mt-2 space-y-2 rounded-lg border border-border bg-surface-muted/25 p-3">
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => changeStatus(status.value)}
                    disabled={isPending}
                    aria-pressed={current.status === status.value}
                    className={tagClass(current.status === status.value)}
                  >
                    {current.status === status.value ? (
                      <Check aria-hidden="true" className="size-3" />
                    ) : null}
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                Priority
              </p>
              <div className="flex flex-wrap gap-1.5">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => changePriority(priority.value)}
                    disabled={isPending || !details}
                    aria-pressed={current.priority === priority.value}
                    className={tagClass(current.priority === priority.value)}
                  >
                    {current.priority === priority.value ? (
                      <Check aria-hidden="true" className="size-3" />
                    ) : null}
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <ListChecks aria-hidden="true" className="size-3.5" />
              Subtask checklist
            </h3>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {doneSubtasks}/{subtasks.length}
            </span>
          </div>

          <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card">
            <div className="h-1 bg-surface-muted">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ul className="divide-y divide-border">
              {subtasks.map((subtask) => {
                const isDone = subtask.status === "DONE";
                return (
                  <li
                    key={subtask.id}
                    className="flex items-center gap-2.5 px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSubtask(subtask)}
                      disabled={isPending}
                      aria-label={
                        isDone
                          ? `Reopen ${subtask.title}`
                          : `Complete ${subtask.title}`
                      }
                      aria-pressed={isDone}
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border transition-all duration-200 active:scale-90 disabled:opacity-50",
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border bg-background text-transparent hover:border-emerald-500/60",
                      )}
                    >
                      <Check aria-hidden="true" className="size-3" />
                    </button>
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-xs",
                        isDone
                          ? "text-muted-foreground line-through"
                          : "text-foreground",
                      )}
                    >
                      {subtask.title}
                    </span>
                    <Badge variant={statusVariant(subtask.status)}>
                      {readableLabel(subtask.status)}
                    </Badge>
                  </li>
                );
              })}
            </ul>
            {!subtasks.length ? (
              <p className="flex items-center gap-1.5 px-3 py-3 text-xs text-muted-foreground">
                {!loaded ? (
                  <>
                    <Loader2
                      aria-hidden="true"
                      className="size-3.5 animate-spin"
                    />
                    Loading checklist...
                  </>
                ) : (
                  "No subtasks yet. Add the first one below."
                )}
              </p>
            ) : null}
            <form
              ref={formRef}
              action={subtaskAction}
              className="space-y-2 border-t border-border bg-surface-muted/25 p-2"
            >
              <div className="flex items-center gap-2">
                <input
                  name="title"
                  required
                  minLength={2}
                  maxLength={160}
                  placeholder="Add a checklist item..."
                  aria-label="New subtask title"
                  className={cn(inputClass, "h-8 py-1 text-xs")}
                />
                <Button
                  type="submit"
                  size="sm"
                  loading={subtaskPending}
                  className="shrink-0"
                >
                  <Plus aria-hidden="true" className="size-3.5" />
                  Add
                </Button>
              </div>
              <FormAlert
                status={subtaskState.status}
                message={subtaskState.message}
              />
            </form>
          </div>
        </section>

        <div className="rounded-lg border border-dashed border-border bg-surface-muted/30 p-3 text-xs leading-5 text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <MessageSquare aria-hidden="true" className="size-3.5" />
            Collaboration
          </span>
          Open the full task to view comments, attachments, and activity.{" "}
          <Paperclip aria-hidden="true" className="inline size-3" />
        </div>
      </div>
    </Sheet>
  );
}
