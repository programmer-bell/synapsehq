import "server-only";

import {
  getWorkspaceAccess,
  hasWorkspacePermission,
  canManageProject,
  canDeleteProject,
} from "@/src/modules/workspaces";
import { logServerError } from "@/src/shared/lib/log-server-error";
import { createProjectSchema, updateProjectSchema } from "../schemas/project";
import {
  createProjectRecord,
  deleteProjectRecord,
  findProjectById,
  listProjectsByWorkspace,
  listProjectsByWorkspaceIds,
  countProjectsByWorkspaceIds,
  updateProjectRecord,
} from "../repositories/project-repository";
import type { Project } from "../types";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; code: string };

function toProject(record: {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): Project {
  return record;
}

export async function createProject(
  userId: string,
  input: unknown,
): Promise<ServiceResult<Project>> {
  const parsed = createProjectSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const access = await getWorkspaceAccess(userId, parsed.data.workspaceId);

  if (!access) {
    return { ok: false, code: "WORKSPACE_NOT_FOUND" };
  }

  if (!hasWorkspacePermission(access.membership.role, "projects:create")) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    const project = await createProjectRecord({
      workspaceId: parsed.data.workspaceId,
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      createdBy: userId,
    });

    return { ok: true, data: toProject(project) };
  } catch (error) {
    logServerError("createProject failed", error, { userId });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function listProjectsForWorkspace(
  userId: string,
  workspaceId: string,
): Promise<ServiceResult<Project[]>> {
  const access = await getWorkspaceAccess(userId, workspaceId);

  if (!access) {
    return { ok: false, code: "WORKSPACE_NOT_FOUND" };
  }

  if (!hasWorkspacePermission(access.membership.role, "projects:read")) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    const projects = await listProjectsByWorkspace(workspaceId);
    return { ok: true, data: projects.map(toProject) };
  } catch (error) {
    logServerError("listProjectsForWorkspace failed", error, {
      userId,
      workspaceId,
    });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function countProjectsForWorkspaces(
  workspaceIds: string[],
): Promise<Record<string, number>> {
  try {
    return await countProjectsByWorkspaceIds(workspaceIds);
  } catch (error) {
    logServerError("countProjectsForWorkspaces failed", error, {
      workspaceCount: workspaceIds.length,
    });
    throw error;
  }
}

export async function listProjectsForWorkspaces(
  workspaceIds: string[],
): Promise<Project[]> {
  try {
    const records = await listProjectsByWorkspaceIds(workspaceIds);
    return records.map(toProject);
  } catch (error) {
    logServerError("listProjectsForWorkspaces failed", error, {
      workspaceCount: workspaceIds.length,
    });
    throw error;
  }
}

export async function getProjectAccess(
  userId: string,
  projectId: string,
): Promise<{
  project: Project;
  workspaceId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdBy: string;
} | null> {
  try {
    const project = await findProjectById(projectId);

    if (!project) {
      return null;
    }

    const access = await getWorkspaceAccess(userId, project.workspaceId);

    if (!access) {
      return null;
    }

    if (!hasWorkspacePermission(access.membership.role, "projects:read")) {
      return null;
    }

    return {
      project: toProject(project),
      workspaceId: project.workspaceId,
      role: access.membership.role,
      createdBy: project.createdBy,
    };
  } catch (error) {
    logServerError("getProjectAccess failed", error, { userId, projectId });
    throw error;
  }
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: unknown,
): Promise<ServiceResult<Project>> {
  const access = await getProjectAccess(userId, projectId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (!canManageProject(access.role, access.createdBy, userId)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = updateProjectSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  try {
    const project = await updateProjectRecord(projectId, parsed.data);
    return { ok: true, data: toProject(project) };
  } catch (error) {
    logServerError("updateProject failed", error, { userId, projectId });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function deleteProject(
  userId: string,
  projectId: string,
): Promise<ServiceResult<void>> {
  const access = await getProjectAccess(userId, projectId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (!canDeleteProject(access.role, access.createdBy, userId)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    await deleteProjectRecord(projectId);
    return { ok: true, data: undefined };
  } catch (error) {
    logServerError("deleteProject failed", error, { userId, projectId });
    return { ok: false, code: "UNKNOWN" };
  }
}
