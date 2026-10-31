import "server-only";

import { and, count, eq, inArray } from "drizzle-orm";

import { db } from "@/src/shared/db";

import { projects, type ProjectRecord } from "../db/schema";

export function findProjectById(id: string): Promise<ProjectRecord | null> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export async function listProjectsByWorkspace(
  workspaceId: string,
): Promise<ProjectRecord[]> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(projects.createdAt);
}

export async function listProjectsByWorkspaceIds(
  workspaceIds: string[],
): Promise<ProjectRecord[]> {
  if (workspaceIds.length === 0) {
    return [];
  }
  return db
    .select()
    .from(projects)
    .where(inArray(projects.workspaceId, workspaceIds))
    .orderBy(projects.name);
}

export async function countProjectsByWorkspaceIds(
  workspaceIds: string[],
): Promise<Record<string, number>> {
  if (workspaceIds.length === 0) {
    return {};
  }
  const rows = await db
    .select({
      workspaceId: projects.workspaceId,
      count: count(),
    })
    .from(projects)
    .where(inArray(projects.workspaceId, workspaceIds))
    .groupBy(projects.workspaceId);

  const result: Record<string, number> = {};
  for (const id of workspaceIds) {
    result[id] = 0;
  }
  for (const row of rows) {
    result[row.workspaceId] = Number(row.count);
  }
  return result;
}

export async function createProjectRecord(input: {
  workspaceId: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
  createdBy: string;
}): Promise<ProjectRecord> {
  const [project] = await db.insert(projects).values(input).returning();
  return project;
}

export async function updateProjectRecord(
  id: string,
  input: {
    name: string;
    description: string | null;
    status: "ACTIVE" | "ARCHIVED";
  },
): Promise<ProjectRecord> {
  const [project] = await db
    .update(projects)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return project;
}

export async function deleteProjectRecord(id: string): Promise<void> {
  await db.delete(projects).where(eq(projects.id, id));
}

export async function findProjectInWorkspace(
  projectId: string,
  workspaceId: string,
): Promise<ProjectRecord | null> {
  const rows = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)),
    )
    .limit(1);

  return rows[0] ?? null;
}
