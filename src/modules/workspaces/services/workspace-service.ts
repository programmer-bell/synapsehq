import "server-only";

import { db } from "@/src/shared/db";

import { workspaces, workspaceMembers } from "../db/schema";
import { getUserByEmail } from "@/src/modules/auth";
import { createUniqueWorkspaceSlug } from "../lib/slug";
import { hasWorkspacePermission } from "../lib/permissions";
import {
  createWorkspaceMembership,
  deleteWorkspaceMembership,
  deleteWorkspaceRecord,
  findWorkspaceById,
  findWorkspaceBySlug,
  findWorkspaceMembership,
  listWorkspaceMembers,
  listWorkspacesForUser,
  updateWorkspaceRecord,
} from "../repositories/workspace-repository";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
} from "../schemas/workspace";
import type {
  Workspace,
  WorkspaceAccess,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceSummary,
} from "../types";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; code: string };

function toWorkspace(record: {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}): Workspace {
  return record;
}

function toMember(record: {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
  user?: { id: string; name: string; email: string };
}): WorkspaceMember {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    userId: record.userId,
    role: record.role,
    joinedAt: record.joinedAt,
    user: record.user,
  };
}

export async function createWorkspace(
  userId: string,
  input: unknown,
): Promise<ServiceResult<Workspace>> {
  const parsed = createWorkspaceSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  try {
    const slug = await createUniqueWorkspaceSlug(
      parsed.data.name,
      async (candidate) => Boolean(await findWorkspaceBySlug(candidate)),
    );

    const workspace = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(workspaces)
        .values({
          name: parsed.data.name,
          slug,
          ownerId: userId,
        })
        .returning();

      await tx.insert(workspaceMembers).values({
        workspaceId: created.id,
        userId,
        role: "OWNER",
      });

      return created;
    });

    return { ok: true, data: toWorkspace(workspace) };
  } catch {
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function listWorkspacesForUserWithSummary(
  userId: string,
): Promise<WorkspaceSummary[]> {
  const rows = await listWorkspacesForUser(userId);

  return Promise.all(
    rows.map(async (row) => {
      const [projects, members] = await Promise.all([
        import("@/src/modules/projects/repositories/project-repository").then(
          (module) => module.listProjectsByWorkspace(row.workspace.id),
        ),
        listWorkspaceMembers(row.workspace.id),
      ]);

      return {
        ...toWorkspace(row.workspace),
        role: row.role,
        projectCount: projects.length,
        memberCount: members.length,
      };
    }),
  );
}

export async function getWorkspaceAccess(
  userId: string,
  workspaceId: string,
): Promise<WorkspaceAccess | null> {
  const workspace = await findWorkspaceById(workspaceId);

  if (!workspace) {
    return null;
  }

  const membership = await findWorkspaceMembership(workspaceId, userId);

  if (!membership) {
    return null;
  }

  return {
    workspace: toWorkspace(workspace),
    membership: toMember(membership),
  };
}

export async function updateWorkspace(
  userId: string,
  workspaceId: string,
  input: unknown,
): Promise<ServiceResult<Workspace>> {
  const access = await getWorkspaceAccess(userId, workspaceId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (!hasWorkspacePermission(access.membership.role, "workspace:update")) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = updateWorkspaceSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  try {
    const updated = await updateWorkspaceRecord(workspaceId, {
      name: parsed.data.name,
    });

    return { ok: true, data: toWorkspace(updated) };
  } catch {
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function deleteWorkspace(
  userId: string,
  workspaceId: string,
): Promise<ServiceResult<void>> {
  const access = await getWorkspaceAccess(userId, workspaceId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (!hasWorkspacePermission(access.membership.role, "workspace:delete")) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    await deleteWorkspaceRecord(workspaceId);
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function addWorkspaceMember(
  userId: string,
  workspaceId: string,
  input: unknown,
): Promise<ServiceResult<WorkspaceMember>> {
  const access = await getWorkspaceAccess(userId, workspaceId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (!hasWorkspacePermission(access.membership.role, "members:manage")) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = addWorkspaceMemberSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const targetUser = await getUserByEmail(parsed.data.email);

  if (!targetUser) {
    return { ok: false, code: "USER_NOT_FOUND" };
  }

  const existingMembership = await findWorkspaceMembership(
    workspaceId,
    targetUser.id,
  );

  if (existingMembership) {
    return { ok: false, code: "ALREADY_MEMBER" };
  }

  try {
    const membership = await createWorkspaceMembership({
      workspaceId,
      userId: targetUser.id,
      role: parsed.data.role,
    });

    const members = await listWorkspaceMembers(workspaceId);
    const created = members.find((member) => member.id === membership.id);

    return {
      ok: true,
      data: toMember(created ?? { ...membership, user: targetUser }),
    };
  } catch {
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function removeWorkspaceMember(
  userId: string,
  workspaceId: string,
  targetUserId: string,
): Promise<ServiceResult<void>> {
  const access = await getWorkspaceAccess(userId, workspaceId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (!hasWorkspacePermission(access.membership.role, "members:manage")) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const targetMembership = await findWorkspaceMembership(
    workspaceId,
    targetUserId,
  );

  if (!targetMembership) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (targetMembership.userId === access.workspace.ownerId) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    await deleteWorkspaceMembership(workspaceId, targetUserId);
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function listWorkspaceMembersForUser(
  userId: string,
  workspaceId: string,
): Promise<ServiceResult<WorkspaceMember[]>> {
  const access = await getWorkspaceAccess(userId, workspaceId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (!hasWorkspacePermission(access.membership.role, "members:read")) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const members = await listWorkspaceMembers(workspaceId);
  return { ok: true, data: members.map(toMember) };
}
