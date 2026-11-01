"use client";

import Link from "next/link";
import {
  CalendarRange,
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/src/shared/lib/cn";

type AssignableUser = {
  id: string;
  name: string;
  email: string;
};

type TaskFiltersProps = {
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
  view: "kanban" | "table";
  assignableUsers: AssignableUser[];
};

const fieldClass =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20";

const selectClass = `${fieldClass} cursor-pointer`;

export function TaskFilters({
  projectId,
  filters,
  view,
  assignableUsers,
}: TaskFiltersProps) {
  const { toast } = useToast();
  const [advanced, setAdvanced] = useState(
    Boolean(filters.dueBefore || filters.dueAfter),
  );

  const activeCount = [
    filters.search,
    filters.status !== "ALL" ? filters.status : "",
    filters.priority !== "ALL" ? filters.priority : "",
    filters.assigneeId !== "ALL" ? filters.assigneeId : "",
    filters.dueBefore,
    filters.dueAfter,
  ].filter(Boolean).length;

  return (
    <form
      method="get"
      action={`/projects/${projectId}/tasks`}
      onSubmit={() =>
        toast({
          title: "Filters applied",
          description: "The task list has been updated.",
          variant: "info",
          duration: 2200,
        })
      }
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <input type="hidden" name="view" value={view} />
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-surface-muted/35 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <SlidersHorizontal aria-hidden="true" className="size-3.5" />
          </span>
          <span className="text-xs font-semibold text-foreground">
            Filter tasks
          </span>
          {activeCount ? (
            <Badge variant="violet" dot>
              {activeCount} active
            </Badge>
          ) : (
            <Badge variant="outline">All tasks</Badge>
          )}
        </div>
        <button
          type="button"
          onClick={() => setAdvanced((open) => !open)}
          aria-expanded={advanced}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <CalendarRange aria-hidden="true" className="size-3.5" />
          Dates & sorting
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-3.5 transition-transform duration-200",
              advanced && "rotate-180",
            )}
          />
        </button>
      </div>

      <div className="space-y-3 p-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5">
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Search aria-hidden="true" className="size-3" />
              Search
            </span>
            <input
              name="search"
              defaultValue={filters.search}
              placeholder="Search tasks"
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Status
            </span>
            <select
              name="status"
              defaultValue={filters.status}
              className={selectClass}
            >
              <option value="ALL">All statuses</option>
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="IN_REVIEW">In review</option>
              <option value="DONE">Done</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Priority
            </span>
            <select
              name="priority"
              defaultValue={filters.priority}
              className={selectClass}
            >
              <option value="ALL">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Assignee
            </span>
            <select
              name="assigneeId"
              defaultValue={filters.assigneeId}
              className={selectClass}
            >
              <option value="ALL">All assignees</option>
              <option value="UNASSIGNED">Unassigned</option>
              {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {advanced ? (
          <div className="grid animate-fade-up gap-3 rounded-lg border border-border/70 bg-surface-muted/25 p-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Due after
              </span>
              <input
                name="dueAfter"
                type="date"
                defaultValue={filters.dueAfter}
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Due before
              </span>
              <input
                name="dueBefore"
                type="date"
                defaultValue={filters.dueBefore}
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Sort by
              </span>
              <select
                name="sortBy"
                defaultValue={filters.sortBy}
                className={selectClass}
              >
                <option value="createdAt">Created</option>
                <option value="dueDate">Due date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Direction
              </span>
              <select
                name="sortDirection"
                defaultValue={filters.sortDirection}
                className={selectClass}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="md">
            <Filter aria-hidden="true" className="size-3.5" />
            Apply filters
          </Button>
          <Link
            href={`/projects/${projectId}/tasks?view=${view}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:text-accent active:scale-[0.98]"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
            Reset
          </Link>
          <span className="ml-auto hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
            <Sparkles aria-hidden="true" className="size-3 text-accent" />
            Filters update instantly after applying
          </span>
        </div>
      </div>
    </form>
  );
}
