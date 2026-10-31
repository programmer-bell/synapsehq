import "server-only";

import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";

import { db } from "@/src/shared/db";

import { tasks, type TaskRecord } from "../db/schema";

const priorityOrder = sql`case ${tasks.priority} when 'URGENT' then 4 when 'HIGH' then 3 when 'MEDIUM' then 2 else 1 end`;

export type TaskListFilters = {
  status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "ALL";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "ALL";
  assigneeId?: string | "ALL" | "UNASSIGNED";
  search?: string;
  dueBefore?: Date | null;
  dueAfter?: Date | null;
  sortBy?: "createdAt" | "dueDate" | "priority" | "title" | "status";
  sortDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export function findTaskById(id: string): Promise<TaskRecord | null> {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export async function listTasksByProject(
  projectId: string,
  filters: TaskListFilters = {},
): Promise<TaskRecord[]> {
  const conditions = [eq(tasks.projectId, projectId)];

  if (filters.status && filters.status !== "ALL") {
    conditions.push(eq(tasks.status, filters.status));
  }

  if (filters.priority && filters.priority !== "ALL") {
    conditions.push(eq(tasks.priority, filters.priority));
  }

  if (filters.assigneeId && filters.assigneeId !== "ALL") {
    if (filters.assigneeId === "UNASSIGNED") {
      conditions.push(isNull(tasks.assigneeId));
    } else {
      conditions.push(eq(tasks.assigneeId, filters.assigneeId));
    }
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(tasks.title, `%${filters.search}%`),
        ilike(tasks.description, `%${filters.search}%`),
      )!,
    );
  }

  if (filters.dueBefore) {
    conditions.push(sql`${tasks.dueDate} <= ${filters.dueBefore}`);
  }

  if (filters.dueAfter) {
    conditions.push(sql`${tasks.dueDate} >= ${filters.dueAfter}`);
  }

  const sortColumn = {
    createdAt: tasks.createdAt,
    dueDate: tasks.dueDate,
    priority: priorityOrder,
    title: tasks.title,
    status: tasks.status,
  }[filters.sortBy ?? "createdAt"];

  const orderBy =
    (filters.sortDirection ?? "desc") === "asc"
      ? asc(sortColumn)
      : desc(sortColumn);

  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(filters.limit ?? 100)
    .offset(filters.offset ?? 0);
}

export async function createTaskRecord(input: {
  projectId: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId: string | null;
  dueDate: Date | null;
  createdBy: string;
}): Promise<TaskRecord> {
  const [task] = await db.insert(tasks).values(input).returning();
  return task;
}

export async function updateTaskRecord(
  id: string,
  input: {
    title: string;
    description: string | null;
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assigneeId: string | null;
    dueDate: Date | null;
  },
): Promise<TaskRecord> {
  const [task] = await db
    .update(tasks)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  return task;
}

export async function updateTaskStatusRecord(
  id: string,
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
): Promise<TaskRecord> {
  const [task] = await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  return task;
}

export async function deleteTaskRecord(id: string): Promise<void> {
  await db.delete(tasks).where(eq(tasks.id, id));
}
