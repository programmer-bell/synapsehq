"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/src/modules/auth";
import {
  createTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
} from "../services/task-service";
import { createTaskSchema, updateTaskSchema } from "../schemas/task";
import type { TaskFormState } from "../types";

function toFieldErrors(error: z.ZodError) {
  const fieldErrors = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([, messages]) => messages && messages.length > 0),
  );
}

export async function createTaskAction(
  _previousState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const user = await requireUser();
  const parsed = createTaskSchema.safeParse({
    projectId: String(formData.get("projectId") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "TODO"),
    priority: String(formData.get("priority") ?? "MEDIUM"),
    assigneeId: String(formData.get("assigneeId") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const result = await createTask(user.id, parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message:
        result.code === "FORBIDDEN"
          ? "You do not have permission to create tasks in this project."
          : result.code === "PROJECT_NOT_FOUND"
            ? "Project not found."
            : result.code === "INVALID_ASSIGNEE"
              ? "Assignee must be a workspace member."
              : "We could not create the task. Please try again.",
    };
  }

  const projectId = parsed.data.projectId;
  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath(`/projects/${projectId}`);
  return { status: "success", message: "Task created." };
}

export async function updateTaskAction(
  taskId: string,
  _previousState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = updateTaskSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "TODO"),
    priority: String(formData.get("priority") ?? "MEDIUM"),
    assigneeId: String(formData.get("assigneeId") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const result = await updateTask(user.id, taskId, parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message:
        result.code === "FORBIDDEN"
          ? "You do not have permission to update this task."
          : result.code === "NOT_FOUND"
            ? "Task not found."
            : result.code === "INVALID_ASSIGNEE"
              ? "Assignee must be a workspace member."
              : "We could not update the task. Please try again.",
    };
  }

  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath(`/projects/${projectId}`);
  if (projectId) revalidatePath(`/projects/${projectId}/tasks/${taskId}/edit`);
  return { status: "success", message: "Task updated." };
}

export async function updateTaskStatusAction(
  taskId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const result = await updateTaskStatus(
    user.id,
    taskId,
    String(formData.get("status") ?? ""),
  );

  if (!result.ok) {
    return;
  }

  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTaskAction(
  taskId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const result = await deleteTask(user.id, taskId);

  if (!result.ok) {
    return;
  }

  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath(`/projects/${projectId}`);
}