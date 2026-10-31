import "server-only";

import { canManageProject } from "@/src/modules/workspaces";
import { getProjectAccess } from "./project-service";
import { notifyUser } from "@/src/modules/notifications";
import { logServerError } from "@/src/shared/lib/log-server-error";

import {
  createMilestoneRecord,
  createProjectMember,
  findMilestone,
  findProjectMember,
  listMilestones,
  listProjectCandidates,
  listProjectTeam,
  removeProjectMember,
  updateMilestoneStatusRecord,
  countProjectTasks,
} from "../repositories/project-work-repository";
import {
  addProjectMemberSchema,
  createMilestoneSchema,
  updateMilestoneStatusSchema,
} from "../schemas/project-work";

type Result<T> = { ok: true; data: T } | { ok: false; code: string };

export async function getProjectTeam(userId: string, projectId: string) {
  const access = await getProjectAccess(userId, projectId);
  if (!access) return null;

  try {
    const [members, candidates] = await Promise.all([
      listProjectTeam(projectId),
      listProjectCandidates(access.workspaceId),
    ]);
    const assigned = new Set(members.map((member) => member.userId));
    return {
      members,
      candidates: candidates.filter((candidate) => !assigned.has(candidate.id)),
      canManage: canManageProject(access.role, access.createdBy, userId),
    };
  } catch (error) {
    logServerError("getProjectTeam failed", error, { userId, projectId });
    throw error;
  }
}

export async function addProjectTeamMember(
  userId: string,
  projectId: string,
  input: unknown,
): Promise<Result<void>> {
  const access = await getProjectAccess(userId, projectId);
  if (!access) return { ok: false, code: "NOT_FOUND" };
  if (!canManageProject(access.role, access.createdBy, userId)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = addProjectMemberSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };

  try {
    const candidate = await listProjectCandidates(access.workspaceId);
    if (!candidate.some((member) => member.id === parsed.data.userId)) {
      return { ok: false, code: "NOT_WORKSPACE_MEMBER" };
    }
    if (await findProjectMember(projectId, parsed.data.userId)) {
      return { ok: false, code: "ALREADY_MEMBER" };
    }

    await createProjectMember({
      projectId,
      userId: parsed.data.userId,
      allocationPercent: parsed.data.allocationPercent,
      addedBy: userId,
    });
    await notifyUser({
      userId: parsed.data.userId,
      actorId: userId,
      title: "Added to a project",
      body: `You were added to ${access.project.name}.`,
      href: `/projects/${projectId}`,
    });
    return { ok: true, data: undefined };
  } catch (error) {
    logServerError("addProjectTeamMember failed", error, {
      userId,
      projectId,
    });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function removeProjectTeamMember(
  userId: string,
  projectId: string,
  targetUserId: string,
): Promise<Result<void>> {
  const access = await getProjectAccess(userId, projectId);
  if (!access) return { ok: false, code: "NOT_FOUND" };
  if (!canManageProject(access.role, access.createdBy, userId)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    if (!(await findProjectMember(projectId, targetUserId))) {
      return { ok: false, code: "NOT_FOUND" };
    }
    await removeProjectMember(projectId, targetUserId);
    return { ok: true, data: undefined };
  } catch (error) {
    logServerError("removeProjectTeamMember failed", error, {
      userId,
      projectId,
    });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function getProjectMilestones(userId: string, projectId: string) {
  const access = await getProjectAccess(userId, projectId);
  if (!access) return null;

  try {
    const [milestones, taskProgress] = await Promise.all([
      listMilestones(projectId),
      countProjectTasks(projectId),
    ]);
    return {
      milestones,
      taskProgress,
      canManage: canManageProject(access.role, access.createdBy, userId),
    };
  } catch (error) {
    logServerError("getProjectMilestones failed", error, {
      userId,
      projectId,
    });
    throw error;
  }
}

export async function isProjectMilestone(
  projectId: string,
  milestoneId: string | null,
): Promise<boolean> {
  if (!milestoneId) return true;
  try {
    const milestone = await findMilestone(milestoneId);
    return milestone?.projectId === projectId;
  } catch (error) {
    logServerError("isProjectMilestone failed", error, {
      projectId,
      milestoneId,
    });
    throw error;
  }
}

export async function createProjectMilestone(
  userId: string,
  input: unknown,
): Promise<Result<{ id: string; projectId: string }>> {
  const parsed = createMilestoneSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };
  const access = await getProjectAccess(userId, parsed.data.projectId);
  if (!access) return { ok: false, code: "NOT_FOUND" };
  if (!canManageProject(access.role, access.createdBy, userId)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    const milestone = await createMilestoneRecord({
      ...parsed.data,
      createdBy: userId,
    });
    try {
      const team = await listProjectTeam(parsed.data.projectId);
      await Promise.all(
        team
          .filter((member) => member.userId !== userId)
          .map((member) =>
            notifyUser({
              userId: member.userId,
              actorId: userId,
              title: "Project milestone created",
              body: parsed.data.name,
              href: `/projects/${parsed.data.projectId}/milestones`,
            }),
          ),
      );
    } catch (error) {
      logServerError("milestone notification dispatch failed", error, {
        userId,
        projectId: parsed.data.projectId,
        milestoneId: milestone.id,
      });
    }
    return {
      ok: true,
      data: { id: milestone.id, projectId: milestone.projectId },
    };
  } catch (error) {
    logServerError("createProjectMilestone failed", error, {
      userId,
      projectId: parsed.data.projectId,
    });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function updateProjectMilestoneStatus(
  userId: string,
  input: unknown,
): Promise<Result<{ projectId: string }>> {
  const parsed = updateMilestoneStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };

  try {
    const milestone = await findMilestone(parsed.data.milestoneId);
    if (!milestone) return { ok: false, code: "NOT_FOUND" };
    const access = await getProjectAccess(userId, milestone.projectId);
    if (!access) return { ok: false, code: "NOT_FOUND" };
    if (!canManageProject(access.role, access.createdBy, userId)) {
      return { ok: false, code: "FORBIDDEN" };
    }
    const updated = await updateMilestoneStatusRecord(
      milestone.id,
      parsed.data.status,
    );
    if (!updated) return { ok: false, code: "NOT_FOUND" };
    return { ok: true, data: { projectId: updated.projectId } };
  } catch (error) {
    logServerError("updateProjectMilestoneStatus failed", error, { userId });
    return { ok: false, code: "UNKNOWN" };
  }
}
