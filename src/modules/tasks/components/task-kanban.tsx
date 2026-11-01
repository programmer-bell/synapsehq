"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Circle,
  CircleCheck,
  CircleDashed,
  Eye,
  GripVertical,
  Loader2,
  UserRound,
} from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import type { DragEvent } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, priorityVariant } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/src/shared/lib/cn";
import { updateTaskStatusAction } from "../actions/task-actions";
import { TaskPreviewSheet } from "./task-preview-sheet";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId: string | null;
  dueDate: Date | null;
};

const columns: {
  status: Task["status"];
  label: string;
  icon: typeof Circle;
  accent: string;
  bar: string;
}[] = [
  {
    status: "TODO",
    label: "To do",
    icon: Circle,
    accent: "text-slate-500",
    bar: "from-slate-400 to-slate-500",
  },
  {
    status: "IN_PROGRESS",
    label: "In progress",
    icon: Loader2,
    accent: "text-amber-500",
    bar: "from-amber-400 to-orange-500",
  },
  {
    status: "IN_REVIEW",
    label: "In review",
    icon: Eye,
    accent: "text-violet-500",
    bar: "from-violet-400 to-fuchsia-500",
  },
  {
    status: "DONE",
    label: "Done",
    icon: CircleCheck,
    accent: "text-emerald-500",
    bar: "from-emerald-400 to-teal-500",
  },
];

function readableLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function TaskKanban({
  tasks,
  projectId,
}: {
  tasks: Task[];
  projectId: string;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<Task["status"] | null>(null);
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [optimisticTasks, applyOptimisticMove] = useOptimistic(
    tasks,
    (state, move: { id: string; status: Task["status"] }) =>
      state.map((task) =>
        task.id === move.id ? { ...task, status: move.status } : task,
      ),
  );

  function moveTask(task: Task, status: Task["status"]) {
    if (task.status === status) return;
    startTransition(async () => {
      applyOptimisticMove({ id: task.id, status });
      if (previewTask?.id === task.id) {
        setPreviewTask({ ...previewTask, status });
      }
      const formData = new FormData();
      formData.set("projectId", projectId);
      formData.set("status", status);
      await updateTaskStatusAction(task.id, formData);
      toast({
        title: "Task status updated",
        description: `${task.title} moved to ${columns.find((column) => column.status === status)?.label}.`,
        variant: "success",
      });
    });
  }

  function onDrop(event: DragEvent, status: Task["status"]) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain") || draggingId;
    const task = optimisticTasks.find((item) => item.id === taskId);
    setDraggingId(null);
    setOverColumn(null);
    if (task) moveTask(task, status);
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => {
          const columnTasks = optimisticTasks.filter(
            (task) => task.status === column.status,
          );
          const Icon = column.icon;
          const isOver = overColumn === column.status;

          return (
            <section
              key={column.status}
              onDragOver={(event) => {
                event.preventDefault();
                setOverColumn(column.status);
              }}
              onDragLeave={(event) => {
                if (
                  !event.currentTarget.contains(event.relatedTarget as Node)
                ) {
                  setOverColumn(null);
                }
              }}
              onDrop={(event) => onDrop(event, column.status)}
              className={cn(
                "flex min-h-[320px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200",
                isOver
                  ? "border-accent/50 ring-2 ring-accent/20"
                  : "border-border",
              )}
            >
              <div className="relative">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r",
                    column.bar,
                  )}
                />
                <div className="flex items-center justify-between gap-2 px-3 py-3">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    <Icon
                      aria-hidden="true"
                      className={cn("size-3.5", column.accent)}
                    />
                    {column.label}
                  </h2>
                  <Badge variant="outline" className="tabular-nums">
                    {columnTasks.length}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 px-2.5 pb-2.5">
                {columnTasks.map((task) => (
                  <article
                    key={task.id}
                    draggable
                    onDragStart={(event) => {
                      setDraggingId(task.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", task.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverColumn(null);
                    }}
                    className={cn(
                      "group cursor-grab rounded-lg border border-border bg-background p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-md active:cursor-grabbing",
                      draggingId === task.id && "opacity-45",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-1.5">
                        <GripVertical
                          aria-hidden="true"
                          className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewTask(task)}
                          className="text-left text-sm font-medium leading-5 text-foreground transition-colors hover:text-accent"
                        >
                          {task.title}
                        </button>
                      </div>
                      <Badge
                        variant={priorityVariant(task.priority)}
                        className="shrink-0"
                      >
                        {readableLabel(task.priority)}
                      </Badge>
                    </div>

                    {task.description ? (
                      <p className="mt-2 line-clamp-2 pl-5 text-xs leading-5 text-muted-foreground">
                        {task.description}
                      </p>
                    ) : null}

                    <div className="mt-3 flex items-center justify-between gap-2 pl-5">
                      <div className="flex items-center gap-1.5">
                        {task.assigneeId ? (
                          <Avatar name="Assigned member" size="xs" />
                        ) : (
                          <span className="flex size-6 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                            <UserRound aria-hidden="true" className="size-3" />
                          </span>
                        )}
                        {task.dueDate ? (
                          <span
                            suppressHydrationWarning
                            className="flex items-center gap-1 text-[10px] text-muted-foreground"
                          >
                            <CalendarDays
                              aria-hidden="true"
                              className="size-3"
                            />
                            {task.dueDate.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
                        <Tooltip content="Quick preview" side="top">
                          <button
                            type="button"
                            onClick={() => setPreviewTask(task)}
                            aria-label={`Preview ${task.title}`}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                          >
                            <Eye aria-hidden="true" className="size-3.5" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Open full task" side="top">
                          <Link
                            href={`/projects/${projectId}/tasks/${task.id}`}
                            aria-label={`Open ${task.title}`}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                          >
                            <ArrowUpRight
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          </Link>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1 pl-5">
                      {columns
                        .filter((target) => target.status !== task.status)
                        .map((target) => (
                          <button
                            key={target.status}
                            type="button"
                            disabled={isPending}
                            onClick={() => moveTask(task, target.status)}
                            className="rounded-md border border-transparent px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/80 transition-all duration-200 hover:border-border hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
                          >
                            {target.label}
                          </button>
                        ))}
                    </div>
                  </article>
                ))}

                <div
                  className={cn(
                    "mt-auto flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-3 py-5 text-center transition-all duration-200",
                    isOver
                      ? "border-accent/60 bg-accent/10 text-accent"
                      : "border-border/80 bg-surface-muted/20 text-muted-foreground/70",
                  )}
                >
                  <CircleDashed
                    aria-hidden="true"
                    className={cn("size-4", isOver && "animate-spin")}
                  />
                  <p className="text-[10px] font-medium">
                    {isOver
                      ? `Drop to move to ${column.label}`
                      : columnTasks.length
                        ? "Drag a card here to update status"
                        : "Drop a task here"}
                  </p>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <TaskPreviewSheet
        task={previewTask}
        projectId={projectId}
        open={Boolean(previewTask)}
        onOpenChange={(open) => {
          if (!open) setPreviewTask(null);
        }}
      />
    </>
  );
}
