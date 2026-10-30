import "server-only";

import { and, eq } from "drizzle-orm";

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