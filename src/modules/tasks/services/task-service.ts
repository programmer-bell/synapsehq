import "server-only";

import { getProjectAccess } from "@/src/modules/projects";
import { getWorkspaceAccess, listWorkspaceMembers } from "@/src/modules/workspaces";

import { canCreateTasks, canDeleteTask, canReadTasks, canUpdateTask } from "../lib/permissions";
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from "../schemas/task";
import {
  createTaskRecord,
  deleteTaskRecord,
  findTaskById,
  listTasksByProject,
  updateTaskRecord,
  updateTaskStatusRecord,
} from "../repositories/task-repository";
import type { Task, TaskFilters } from "../types";

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string };

function toTask(record: {
  id: string;
  projectId: string;
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
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      createdBy: userId,
    });

    return { ok: true, data: toTask(task) };
  } catch {
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
}

export async function getTaskAccess(
  userId: string,
  taskId: string,
): Promise<
  | {
      task: Task;
      projectId: string;
      workspaceId: string;
      role: "OWNER" | "ADMIN" | "MEMBER";
      createdBy: string;
      assigneeId: string | null;
    }
  | null
> {
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

  if (!canUpdateTask(access.role, access.createdBy, access.assigneeId, userId)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = updateTaskSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
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
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    });

    return { ok: true, data: toTask(task) };
  } catch {
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

  if (!canUpdateTask(access.role, access.createdBy, access.assigneeId, userId)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = updateTaskStatusSchema.safeParse({ status });

  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  try {
    const task = await updateTaskStatusRecord(taskId, parsed.data.status);
    return { ok: true, data: toTask(task) };
  } catch {
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function deleteTask(
  userId: string,
  taskId: string,
): Promise<ServiceResult<void>> {
  const access = await getTaskAccess(userId, taskId);

  if (!access) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (!canDeleteTask(access.role, access.createdBy, userId)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  try {
    await deleteTaskRecord(taskId);
    return { ok: true, data: undefined };
  } catch {
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

  const members = await listWorkspaceMembers(access.workspaceId);

  return {
    ok: true,
    data: members.map((member) => ({
      id: member.userId,
      name: member.user?.name ?? "Unknown user",
      email: member.user?.email ?? "",
    })),
  };
}