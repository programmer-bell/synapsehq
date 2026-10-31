import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { users } from "@/src/modules/auth/db/schema";
import { db } from "@/src/shared/db";

import {
  taskActivity,
  taskAttachments,
  taskComments,
  tasks,
} from "../db/schema";

export async function listTaskSubtasks(taskId: string) {
  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      assigneeId: tasks.assigneeId,
    })
    .from(tasks)
    .where(eq(tasks.parentTaskId, taskId))
    .orderBy(asc(tasks.createdAt));
}

export async function listTaskComments(taskId: string) {
  return db
    .select({
      id: taskComments.id,
      body: taskComments.body,
      createdAt: taskComments.createdAt,
      authorId: taskComments.authorId,
      authorName: users.name,
    })
    .from(taskComments)
    .innerJoin(users, eq(taskComments.authorId, users.id))
    .where(eq(taskComments.taskId, taskId))
    .orderBy(asc(taskComments.createdAt));
}

export async function listTaskActivity(taskId: string) {
  return db
    .select({
      id: taskActivity.id,
      eventType: taskActivity.eventType,
      summary: taskActivity.summary,
      createdAt: taskActivity.createdAt,
      actorName: users.name,
    })
    .from(taskActivity)
    .leftJoin(users, eq(taskActivity.actorId, users.id))
    .where(eq(taskActivity.taskId, taskId))
    .orderBy(desc(taskActivity.createdAt))
    .limit(50);
}

export async function listTaskAttachments(taskId: string) {
  return db
    .select({
      id: taskAttachments.id,
      fileName: taskAttachments.fileName,
      contentType: taskAttachments.contentType,
      sizeBytes: taskAttachments.sizeBytes,
      uploadedBy: taskAttachments.uploadedBy,
      uploaderName: users.name,
      createdAt: taskAttachments.createdAt,
    })
    .from(taskAttachments)
    .innerJoin(users, eq(taskAttachments.uploadedBy, users.id))
    .where(eq(taskAttachments.taskId, taskId))
    .orderBy(desc(taskAttachments.createdAt));
}

export async function createComment(input: {
  taskId: string;
  authorId: string;
  body: string;
}) {
  const [record] = await db.insert(taskComments).values(input).returning();
  return record;
}

export async function createTaskActivity(input: {
  taskId: string;
  actorId: string | null;
  eventType: string;
  summary: string;
}): Promise<void> {
  await db.insert(taskActivity).values(input);
}

export async function createTaskAttachment(input: {
  taskId: string;
  uploadedBy: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  data: Uint8Array;
}) {
  const [record] = await db.insert(taskAttachments).values(input).returning({
    id: taskAttachments.id,
  });
  return record;
}

export async function getTaskAttachment(taskId: string, attachmentId: string) {
  const [record] = await db
    .select({
      id: taskAttachments.id,
      uploadedBy: taskAttachments.uploadedBy,
      fileName: taskAttachments.fileName,
      contentType: taskAttachments.contentType,
      sizeBytes: taskAttachments.sizeBytes,
      data: taskAttachments.data,
    })
    .from(taskAttachments)
    .where(
      and(
        eq(taskAttachments.taskId, taskId),
        eq(taskAttachments.id, attachmentId),
      ),
    )
    .limit(1);
  return record ?? null;
}

export async function deleteTaskAttachment(
  taskId: string,
  attachmentId: string,
): Promise<void> {
  await db
    .delete(taskAttachments)
    .where(
      and(
        eq(taskAttachments.taskId, taskId),
        eq(taskAttachments.id, attachmentId),
      ),
    );
}
