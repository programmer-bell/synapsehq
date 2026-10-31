import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/src/shared/db";

import { users } from "@/src/modules/auth/db/schema";
import {
  workspaceMembers,
  workspaces,
  type WorkspaceMemberRecord,
  type WorkspaceRecord,
} from "../db/schema";

export function findWorkspaceById(id: string): Promise<WorkspaceRecord | null> {
  return db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export function findWorkspaceBySlug(
  slug: string,
): Promise<WorkspaceRecord | null> {
  return db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export async function createWorkspaceRecord(input: {
  name: string;
  slug: string;
  ownerId: string;
}): Promise<WorkspaceRecord> {
  const [workspace] = await db.insert(workspaces).values(input).returning();
  return workspace;
}

export async function updateWorkspaceRecord(
  id: string,
  input: { name?: string; slug?: string },
): Promise<WorkspaceRecord> {
  const [workspace] = await db
    .update(workspaces)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(workspaces.id, id))
    .returning();
  return workspace;
}

export async function deleteWorkspaceRecord(id: string): Promise<void> {
  await db.delete(workspaces).where(eq(workspaces.id, id));
}

export function findWorkspaceMembership(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceMemberRecord | null> {
  return db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export async function createWorkspaceMembership(input: {
  workspaceId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}): Promise<WorkspaceMemberRecord> {
  const [membership] = await db
    .insert(workspaceMembers)
    .values(input)
    .returning();
  return membership;
}

export async function deleteWorkspaceMembership(
  workspaceId: string,
  userId: string,
): Promise<void> {
  await db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    );
}

export async function listWorkspaceMembers(workspaceId: string): Promise<
  Array<
    WorkspaceMemberRecord & {
      user: { id: string; name: string; email: string };
    }
  >
> {
  const rows = await db
    .select({
      membership: workspaceMembers,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  return rows.map((row) => ({
    ...row.membership,
    user: row.user,
  }));
}

export async function listWorkspacesForUser(
  userId: string,
): Promise<
  Array<{ workspace: WorkspaceRecord; role: "OWNER" | "ADMIN" | "MEMBER" }>
> {
  const rows = await db
    .select({
      workspace: workspaces,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId));

  return rows;
}
