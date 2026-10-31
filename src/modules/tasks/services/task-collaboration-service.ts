import "server-only";

import { notifyUser } from "@/src/modules/notifications";
import { canUpdateTask } from "../lib/permissions";
import { logServerError } from "@/src/shared/lib/log-server-error";

import { getTaskAccess } from "./task-service";
import {
  createComment,
  createTaskActivity,
  createTaskAttachment,
  deleteTaskAttachment,
  getTaskAttachment,
  listTaskActivity,
  listTaskAttachments,
  listTaskComments,
  listTaskSubtasks,
} from "../repositories/task-collaboration-repository";
import { createTaskRecord } from "../repositories/task-repository";

const attachmentLimitBytes = 3 * 1024 * 1024;
const allowedAttachmentTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

async function recordActivity(
  taskId: string,
  actorId: string,
  eventType: string,
  summary: string,
): Promise<void> {
  try {
    await createTaskActivity({ taskId, actorId, eventType, summary });
  } catch (error) {
    logServerError("task activity recording failed", error, {
      taskId,
      actorId,
    });
  }
}

export async function getTaskDetails(userId: string, taskId: string) {
  const access = await getTaskAccess(userId, taskId);
  if (!access) return null;

  try {
    const [subtasks, comments, attachments, activity] = await Promise.all([
      listTaskSubtasks(taskId),
      listTaskComments(taskId),
      listTaskAttachments(taskId),
      listTaskActivity(taskId),
    ]);
    return { ...access, subtasks, comments, attachments, activity };
  } catch (error) {
    logServerError("getTaskDetails failed", error, { userId, taskId });
    throw error;
  }
}

export async function addTaskComment(
  userId: string,
  taskId: string,
  body: string,
): Promise<{ ok: true; projectId: string } | { ok: false; code: string }> {
  const access = await getTaskAccess(userId, taskId);
  if (!access) return { ok: false, code: "NOT_FOUND" };
  const normalized = body.trim();
  if (!normalized || normalized.length > 4000) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  try {
    await createComment({ taskId, authorId: userId, body: normalized });
    await recordActivity(taskId, userId, "COMMENT_ADDED", "Added a comment.");
    if (access.assigneeId && access.assigneeId !== userId) {
      await notifyUser({
        userId: access.assigneeId,
        actorId: userId,
        title: "New task comment",
        body: access.task.title,
        href: `/projects/${access.projectId}/tasks/${taskId}`,
      });
    }
    return { ok: true, projectId: access.projectId };
  } catch (error) {
    logServerError("addTaskComment failed", error, { userId, taskId });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function createTaskSubtask(
  userId: string,
  parentTaskId: string,
  title: string,
): Promise<{ ok: true; projectId: string } | { ok: false; code: string }> {
  const access = await getTaskAccess(userId, parentTaskId);
  if (!access) return { ok: false, code: "NOT_FOUND" };
  if (
    !canUpdateTask(access.role, access.createdBy, access.assigneeId, userId)
  ) {
    return { ok: false, code: "FORBIDDEN" };
  }
  const normalized = title.trim();
  if (normalized.length < 2 || normalized.length > 160) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  try {
    if (access.task.parentTaskId) {
      return { ok: false, code: "NESTED_SUBTASK" };
    }
    await createTaskRecord({
      projectId: access.projectId,
      parentTaskId,
      milestoneId: null,
      title: normalized,
      description: null,
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: null,
      dueDate: null,
      createdBy: userId,
    });
    await recordActivity(
      parentTaskId,
      userId,
      "SUBTASK_CREATED",
      "Added a subtask.",
    );
    return { ok: true, projectId: access.projectId };
  } catch (error) {
    logServerError("createTaskSubtask failed", error, {
      userId,
      taskId: parentTaskId,
    });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function uploadTaskAttachment(
  userId: string,
  taskId: string,
  file: File,
): Promise<{ ok: true; projectId: string } | { ok: false; code: string }> {
  const access = await getTaskAccess(userId, taskId);
  if (!access) return { ok: false, code: "NOT_FOUND" };
  if (
    !canUpdateTask(access.role, access.createdBy, access.assigneeId, userId)
  ) {
    return { ok: false, code: "FORBIDDEN" };
  }
  if (
    file.size < 1 ||
    file.size > attachmentLimitBytes ||
    !allowedAttachmentTypes.has(file.type)
  ) {
    return { ok: false, code: "INVALID_FILE" };
  }

  const safeName = file.name
    .replace(/[\\/\\u0000-\\u001f\\u007f]/g, "_")
    .trim()
    .slice(0, 255);
  if (!safeName) return { ok: false, code: "INVALID_FILE" };

  try {
    await createTaskAttachment({
      taskId,
      uploadedBy: userId,
      fileName: safeName,
      contentType: file.type,
      sizeBytes: file.size,
      data: new Uint8Array(await file.arrayBuffer()),
    });
    await recordActivity(
      taskId,
      userId,
      "ATTACHMENT_ADDED",
      "Added an attachment.",
    );
    return { ok: true, projectId: access.projectId };
  } catch (error) {
    logServerError("uploadTaskAttachment failed", error, { userId, taskId });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function removeTaskAttachment(
  userId: string,
  taskId: string,
  attachmentId: string,
): Promise<{ ok: true; projectId: string } | { ok: false; code: string }> {
  const access = await getTaskAccess(userId, taskId);
  if (!access) return { ok: false, code: "NOT_FOUND" };
  if (
    !canUpdateTask(access.role, access.createdBy, access.assigneeId, userId)
  ) {
    return { ok: false, code: "FORBIDDEN" };
  }
  try {
    const attachment = await getTaskAttachment(taskId, attachmentId);
    if (!attachment) return { ok: false, code: "NOT_FOUND" };
    await deleteTaskAttachment(taskId, attachmentId);
    await recordActivity(
      taskId,
      userId,
      "ATTACHMENT_REMOVED",
      "Removed an attachment.",
    );
    return { ok: true, projectId: access.projectId };
  } catch (error) {
    logServerError("removeTaskAttachment failed", error, {
      userId,
      taskId,
      attachmentId,
    });
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function getTaskAttachmentForUser(
  userId: string,
  taskId: string,
  attachmentId: string,
) {
  if (!(await getTaskAccess(userId, taskId))) return null;
  try {
    return await getTaskAttachment(taskId, attachmentId);
  } catch (error) {
    logServerError("getTaskAttachmentForUser failed", error, {
      userId,
      taskId,
      attachmentId,
    });
    throw error;
  }
}
