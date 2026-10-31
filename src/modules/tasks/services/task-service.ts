import "server-only";

import { getProjectAccess, isProjectMilestone } from "@/src/modules/projects";
import { notifyUser } from "@/src/modules/notifications";
import {
  getWorkspaceAccess,
  listWorkspaceMembers,
} from "@/src/modules/workspaces";

import {
  canCreateTasks,
  canDeleteTask,
  canReadTasks,
  canUpdateTask,
} from "../lib/permissions";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "../schemas/task";
import {
  createTaskRecord,
  deleteTaskRecord,
  findTaskById,
  listTasksByProject,
  updateTaskRecord,
  updateTaskStatusRecord,
} from "../repositories/task-repository";
import { createTaskActivity } from "../repositories/task-collaboration-repository";
import type { Task, TaskFilters } from "../types";
import { logServerError } from "@/src/shared/lib/log-server-error";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; code: string };

function toTask(record: {
  id: string;
  projectId: string;
  parentTaskId: string | null;
  milestoneId: string | null;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId: string | null;
  dueDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): Task {
  return record;
}

async function validateAssignee(
  assigneeId: string | null,
  workspaceId: string,
): Promise<boolean> {
  if (!assigneeId) {
    return true;
  }

  const membership = await getWorkspaceAccess(assigneeId, workspaceId);
  return membership !== null;
}

export async function createTask(
  userId: string,
  input: unknown,
): Promise<ServiceResult<Task>> {
  const parsed = createTaskSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const access = await getProjectAccess(userId, parsed.data.projectId);

  if (!access) {
    return { ok: false, code: "PROJECT_NOT_FOUND" };
  }

  if (!canCreateTasks(access.role)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  if (!(await isProjectMilestone(access.project.id, parsed.data.milestoneId))) {
    return { ok: false, code: "INVALID_MILESTONE" };
  }

  const assigneeValid = await validateAssignee(
    parsed.data.assigneeId,
    access.workspaceId,
  );

  if (!assigneeValid) {
    return { ok: false, code: "INVALID_ASSIGNEE" };
  }

  try {
    const task = await createTaskRecord({
      projectId: parsed.data.projectId,
      parentTaskId: null,
      milestoneId: parsed.data.milestoneId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      createdBy: userId,
    });

    try {
      await createTaskActivity({
        taskId: task.id,
        actorId: userId,
        eventType: "TASK_CREATED",
        summary: "Created the task.",
      });
    } catch (error) {
      logServerError("task activity recording failed", error, {
        userId,
        taskId: task.id,
      });
    }
    if (task.assigneeId && task.assigneeId !== userId) {
      await notifyUser({
        userId: task.assigneeId,
        actorId: userId,
        title: "Assigned a task",
        body: task.title,
        href: `/projects/${task.projectId}/tasks/${task.id}`,
      });
    }
    return { ok: true, data: toTask(task) };
  } catch (error) {
    logServerError("createTask failed", error, { userId });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function listTasksForProject(
  userId: string,
  projectId: string,
  filters: TaskFilters = {},
): Promise<ServiceResult<Task[]>> {
  const access = await getProjectAccess(userId, projectId);

  if (!access) {
    return { ok: false, code: "PROJECT_NOT_FOUND" };
  }

  if (!canReadTasks(access.role)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    const tasks = await listTasksByProject(projectId, {
      status: filters.status,
      priority: filters.priority,
      assigneeId: filters.assigneeId,
      search: filters.search,
      dueBefore: filters.dueBefore ? new Date(filters.dueBefore) : null,
      dueAfter: filters.dueAfter ? new Date(filters.dueAfter) : null,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      limit: filters.pageSize ?? 25,
      offset: ((filters.page ?? 1) - 1) * (filters.pageSize ?? 25),
    });

    return { ok: true, data: tasks.map(toTask) };
  } catch (error) {
    logServerError("listTasksForProject failed", error, { userId, projectId });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function getTaskAccess(
  userId: string,
  taskId: string,
): Promise<{
  task: Task;
  projectId: string;
  workspaceId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdBy: string;
  assigneeId: string | null;
} | null> {
  try {
    const record = await findTaskById(taskId);

    if (!record) {
      return null;
    }

    const access = await getProjectAccess(userId, record.projectId);

    if (!access) {
      return null;
    }

    if (!canReadTasks(access.role)) {
      return null;
    }

    return {
      task: toTask(record),
      projectId: record.projectId,
      workspaceId: access.workspaceId,
      role: access.role,
      createdBy: record.createdBy,
      assigneeId: record.assigneeId,
    };
  } catch (error) {
    logServerError("getTaskAccess failed", error, { userId, taskId });
    throw error;
  }
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: unknown,
): Promise<ServiceResult<Task>> {
  const access = await getTaskAccess(userId, taskId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (
    !canUpdateTask(access.role, access.createdBy, access.assigneeId, userId)
  ) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = updateTaskSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  if (!(await isProjectMilestone(access.projectId, parsed.data.milestoneId))) {
    return { ok: false, code: "INVALID_MILESTONE" };
  }

  const assigneeValid = await validateAssignee(
    parsed.data.assigneeId,
    access.workspaceId,
  );

  if (!assigneeValid) {
    return { ok: false, code: "INVALID_ASSIGNEE" };
  }

  try {
    const task = await updateTaskRecord(taskId, {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId,
      milestoneId: parsed.data.milestoneId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    });

    try {
      await createTaskActivity({
        taskId,
        actorId: userId,
        eventType: "TASK_UPDATED",
        summary: "Updated task details.",
      });
    } catch (error) {
      logServerError("task activity recording failed", error, {
        userId,
        taskId,
      });
    }
    if (
      task.assigneeId &&
      task.assigneeId !== userId &&
      task.assigneeId !== access.assigneeId
    ) {
      await notifyUser({
        userId: task.assigneeId,
        actorId: userId,
        title: "Assigned a task",
        body: task.title,
        href: `/projects/${task.projectId}/tasks/${task.id}`,
      });
    }
    return { ok: true, data: toTask(task) };
  } catch (error) {
    logServerError("updateTask failed", error, { userId, taskId });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function updateTaskStatus(
  userId: string,
  taskId: string,
  status: unknown,
): Promise<ServiceResult<Task>> {
  const access = await getTaskAccess(userId, taskId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (
    !canUpdateTask(access.role, access.createdBy, access.assigneeId, userId)
  ) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = updateTaskStatusSchema.safeParse({ status });

  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  try {
    const task = await updateTaskStatusRecord(taskId, parsed.data.status);
    try {
      await createTaskActivity({
        taskId,
        actorId: userId,
        eventType: "STATUS_CHANGED",
        summary: `Changed status to ${parsed.data.status.replaceAll("_", " ").toLowerCase()}.`,
      });
    } catch (error) {
      logServerError("task activity recording failed", error, {
        userId,
        taskId,
      });
    }
    if (task.assigneeId && task.assigneeId !== userId) {
      await notifyUser({
        userId: task.assigneeId,
        actorId: userId,
        title: "Task status changed",
        body: `${task.title}: ${parsed.data.status.replaceAll("_", " ").toLowerCase()}.`,
        href: `/projects/${task.projectId}/tasks/${task.id}`,
      });
    }
    return { ok: true, data: toTask(task) };
  } catch (error) {
    logServerError("updateTaskStatus failed", error, { userId, taskId });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function deleteTask(
  userId: string,
  taskId: string,
): Promise<ServiceResult<{ projectId: string }>> {
  const access = await getTaskAccess(userId, taskId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (!canDeleteTask(access.role, access.createdBy, userId)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    await deleteTaskRecord(taskId);
    return { ok: true, data: { projectId: access.projectId } };
  } catch (error) {
    logServerError("deleteTask failed", error, { userId, taskId });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function listAssignableUsers(
  userId: string,
  projectId: string,
): Promise<ServiceResult<Array<{ id: string; name: string; email: string }>>> {
  const access = await getProjectAccess(userId, projectId);

  if (!access) {
    return { ok: false, code: "PROJECT_NOT_FOUND" };
  }

  if (!canReadTasks(access.role)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    const members = await listWorkspaceMembers(access.workspaceId);

    return {
      ok: true,
      data: members.map((member) => ({
        id: member.userId,
        name: member.user?.name ?? "Unknown user",
        email: member.user?.email ?? "",
      })),
    };
  } catch (error) {
    logServerError("listAssignableUsers failed", error, { userId, projectId });
    return { ok: false, code: "UNKNOWN" };
  }
}
