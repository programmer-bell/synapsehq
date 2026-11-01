"use client";

import Link from "next/link";
import {
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, priorityVariant, statusVariant } from "@/components/ui/badge";
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
  createdAt: Date;
};

type TaskTableProps = {
  tasks: Task[];
  projectId: string;
  filters: {
    search: string;
    status: string;
    priority: string;
    assigneeId: string;
    dueBefore: string;
    dueAfter: string;
    sortBy: string;
    sortDirection: string;
    page: number;
    pageSize: number;
  };
};

function sortLink(
  projectId: string,
  filters: TaskTableProps["filters"],
  sortBy: string,
) {
  const params = new URLSearchParams({
    view: "table",
    search: filters.search,
    status: filters.status,
    priority: filters.priority,
    assigneeId: filters.assigneeId,
    dueBefore: filters.dueBefore,
    dueAfter: filters.dueAfter,
    pageSize: String(filters.pageSize),
    page: String(filters.page),
    sortBy,
    sortDirection:
      filters.sortBy === sortBy && filters.sortDirection === "asc"
        ? "desc"
        : "asc",
  });

  return `/projects/${projectId}/tasks?${params.toString()}`;
}

function readableLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function SortHeader({
  href,
  children,
  active,
}: {
  href: string;
  children: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
        active && "text-accent",
      )}
    >
      {children}
      <ArrowUpDown
        aria-hidden="true"
        className={cn("size-3", active ? "opacity-100" : "opacity-40")}
      />
    </Link>
  );
}

export function TaskTable({ tasks, projectId, filters }: TaskTableProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const allSelected = tasks.length > 0 && selected.size === tasks.length;

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(
      allSelected ? new Set() : new Set(tasks.map((task) => task.id)),
    );
  }

  function closeMenu(event: ReactMouseEvent<HTMLElement>) {
    event.currentTarget.closest("details")?.removeAttribute("open");
  }

  function markSelectedDone() {
    const targets = tasks.filter(
      (task) => selected.has(task.id) && task.status !== "DONE",
    );
    if (!targets.length) {
      toast({
        title: "Nothing to update",
        description: "Selected tasks are already done.",
        variant: "info",
      });
      return;
    }
    startTransition(async () => {
      await Promise.all(
        targets.map((task) => {
          const formData = new FormData();
          formData.set("projectId", projectId);
          formData.set("status", "DONE");
          return updateTaskStatusAction(task.id, formData);
        }),
      );
      setSelected(new Set());
      toast({
        title: "Tasks completed",
        description: `${targets.length} task${targets.length === 1 ? "" : "s"} marked as done.`,
        variant: "success",
      });
    });
  }

  return (
    <>
      {selected.size ? (
        <div className="sticky top-[68px] z-20 mb-2 flex animate-fade-up items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent/[0.07] px-3 py-2 shadow-sm backdrop-blur">
          <span className="text-xs font-medium text-foreground">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markSelectedDone}
              disabled={isPending}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 text-xs font-medium text-emerald-700 transition-all duration-200 hover:bg-emerald-500/15 active:scale-[0.98] disabled:opacity-50 dark:text-emerald-300"
            >
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              Mark done
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <X aria-hidden="true" className="size-3.5" />
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-muted/60">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all tasks"
                    className="size-3.5 cursor-pointer rounded border-border accent-indigo-600"
                  />
                </th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <SortHeader
                    href={sortLink(projectId, filters, "title")}
                    active={filters.sortBy === "title"}
                  >
                    Task
                  </SortHeader>
                </th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <SortHeader
                    href={sortLink(projectId, filters, "status")}
                    active={filters.sortBy === "status"}
                  >
                    Status
                  </SortHeader>
                </th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <SortHeader
                    href={sortLink(projectId, filters, "priority")}
                    active={filters.sortBy === "priority"}
                  >
                    Priority
                  </SortHeader>
                </th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Assignee
                </th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <SortHeader
                    href={sortLink(projectId, filters, "dueDate")}
                    active={filters.sortBy === "dueDate"}
                  >
                    Due
                  </SortHeader>
                </th>
                <th className="w-12 px-3 py-2.5 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task) => {
                const isSelected = selected.has(task.id);
                return (
                  <tr
                    key={task.id}
                    className={cn(
                      "group transition-colors duration-150",
                      isSelected
                        ? "bg-accent/[0.06]"
                        : "hover:bg-surface-muted/50",
                    )}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(task.id)}
                        aria-label={`Select ${task.title}`}
                        className="size-3.5 cursor-pointer rounded border-border accent-indigo-600"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-1.5 size-1.5 shrink-0 rounded-full",
                            task.priority === "URGENT" ||
                              task.priority === "HIGH"
                              ? "bg-rose-500"
                              : task.priority === "MEDIUM"
                                ? "bg-amber-500"
                                : "bg-slate-400",
                          )}
                        />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setPreviewTask(task)}
                            className="text-left text-sm font-medium text-foreground transition-colors hover:text-accent"
                          >
                            {task.title}
                          </button>
                          {task.description ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={statusVariant(task.status)} dot>
                        {readableLabel(task.status)}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={priorityVariant(task.priority)}>
                        {readableLabel(task.priority)}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          name={
                            task.assigneeId ? "Assigned member" : "Unassigned"
                          }
                          size="xs"
                        />
                        <span className="text-xs text-muted-foreground">
                          {task.assigneeId ? "Assigned" : "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        suppressHydrationWarning
                        className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground"
                      >
                        {task.dueDate ? (
                          <>
                            <CalendarDays
                              aria-hidden="true"
                              className="size-3"
                            />
                            {task.dueDate.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </>
                        ) : (
                          "—"
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <details className="group/menu relative inline-block">
                        <summary
                          aria-label={`Actions for ${task.title}`}
                          className="flex size-7 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
                        >
                          <MoreHorizontal
                            aria-hidden="true"
                            className="size-4"
                          />
                        </summary>
                        <div className="absolute right-0 top-8 z-20 w-40 animate-scale-in overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl">
                          <button
                            type="button"
                            onClick={(event) => {
                              closeMenu(event);
                              setPreviewTask(task);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-surface-muted"
                          >
                            <Eye aria-hidden="true" className="size-3.5" />
                            Quick preview
                          </button>
                          <Link
                            href={`/projects/${projectId}/tasks/${task.id}`}
                            onClick={closeMenu}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-surface-muted"
                          >
                            <ArrowUpDown
                              aria-hidden="true"
                              className="size-3.5"
                            />
                            Open task
                          </Link>
                          <Link
                            href={`/projects/${projectId}/tasks/${task.id}/edit`}
                            onClick={closeMenu}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-surface-muted"
                          >
                            <Pencil aria-hidden="true" className="size-3.5" />
                            Edit task
                          </Link>
                        </div>
                      </details>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
