"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/src/modules/auth";
import { logServerError } from "@/src/shared/lib/log-server-error";
import {
  createTask,
  deleteTask,
  listTasksForProject,
  updateTask,
  updateTaskStatus,
} from "../services/task-service";
import { getDashboardData } from "@/src/shared/lib/dashboard-data";
import { createTaskSchema, updateTaskSchema } from "../schemas/task";
import type { TaskFormState } from "../types";

function toFieldErrors(error: z.ZodError) {
  const fieldErrors = z.flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >;
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(
      ([, messages]) => messages && messages.length > 0,
    ),
  );
}

export type TaskSearchResult = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  projectId: string;
  projectName: string;
};

export async function searchWorkspaceTasksAction(
  query: string,
): Promise<TaskSearchResult[]> {
  const user = await requireUser();
  const normalized = query.trim();
  if (normalized.length < 2) return [];

  const { projects } = await getDashboardData(user.id);
  const results = await Promise.all(
    projects.slice(0, 12).map(async (project) => {
      const result = await listTasksForProject(user.id, project.id, {
        search: normalized,
        pageSize: 5,
      });
      if (!result.ok) return [];
      return result.data.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        projectName: project.name,
      }));
    }),
  );

  return results.flat().slice(0, 10);
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
    milestoneId: String(formData.get("milestoneId") ?? ""),
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
              : result.code === "INVALID_MILESTONE"
                ? "Select a milestone from this project."
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
    milestoneId: String(formData.get("milestoneId") ?? ""),
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
              : result.code === "INVALID_MILESTONE"
                ? "Select a milestone from this project."
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
  const status = String(formData.get("status") ?? "");
  const result = await updateTaskStatus(user.id, taskId, status);

  if (!result.ok) {
    if (result.code === "UNKNOWN") {
      logServerError("updateTaskStatusAction failed", new Error(result.code), {
        userId: user.id,
        taskId,
      });
    }
    if (!z.string().uuid().safeParse(projectId).success) {
      throw new Error("Failed to update task status.");
    }
    redirect(`/projects/${projectId}/tasks?actionError=task-status-update`);
  }

  const updatedProjectId = result.data.projectId;
  revalidatePath(`/projects/${updatedProjectId}/tasks`);
  revalidatePath(`/projects/${updatedProjectId}`);
}

export async function deleteTaskAction(
  taskId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const result = await deleteTask(user.id, taskId);
  const projectId = result.ok
    ? result.data.projectId
    : String(formData.get("projectId") ?? "");

  if (!result.ok) {
    if (result.code === "UNKNOWN") {
      logServerError("deleteTaskAction failed", new Error(result.code), {
        userId: user.id,
        taskId,
      });
    }
    if (!z.string().uuid().safeParse(projectId).success) {
      throw new Error("Failed to delete task.");
    }
    redirect(`/projects/${projectId}/tasks?actionError=task-delete`);
  }

  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/tasks`);
}
