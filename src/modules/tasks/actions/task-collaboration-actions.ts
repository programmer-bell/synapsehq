"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/src/modules/auth";
import {
  addTaskComment,
  createTaskSubtask,
  getTaskDetails,
  removeTaskAttachment,
  uploadTaskAttachment,
} from "../services/task-collaboration-service";

type FormState = { status: "idle" | "error" | "success"; message?: string };

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function getTaskPreviewAction(taskId: string) {
  const user = await requireUser();
  const details = await getTaskDetails(user.id, taskId);
  if (!details) return null;
  return { task: details.task, subtasks: details.subtasks };
}

export async function addTaskCommentAction(
  taskId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const result = await addTaskComment(
    user.id,
    taskId,
    getFormValue(formData, "body"),
  );
  if (!result.ok) {
    return {
      status: "error",
      message: "Comment could not be added. Check its length and try again.",
    };
  }
  revalidatePath(`/projects/${result.projectId}/tasks/${taskId}`);
  return { status: "success", message: "Comment added." };
}

export async function createTaskSubtaskAction(
  taskId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const result = await createTaskSubtask(
    user.id,
    taskId,
    getFormValue(formData, "title"),
  );
  if (!result.ok) {
    return {
      status: "error",
      message:
        result.code === "FORBIDDEN"
          ? "You cannot add subtasks to this task."
          : "Subtask could not be added.",
    };
  }
  revalidatePath(`/projects/${result.projectId}/tasks/${taskId}`);
  return { status: "success", message: "Subtask added." };
}

export async function uploadTaskAttachmentAction(
  taskId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: "Choose a file to upload." };
  }
  const result = await uploadTaskAttachment(user.id, taskId, file);
  if (!result.ok) {
    return {
      status: "error",
      message:
        result.code === "INVALID_FILE"
          ? "Use a PDF, PNG, JPEG, WebP, or plain-text file under 3 MB."
          : "Attachment could not be uploaded.",
    };
  }
  revalidatePath(`/projects/${result.projectId}/tasks/${taskId}`);
  return { status: "success", message: "Attachment uploaded." };
}

export async function removeTaskAttachmentAction(
  taskId: string,
  attachmentId: string,
  formData: FormData,
): Promise<void> {
  void formData;
  const user = await requireUser();
  const result = await removeTaskAttachment(user.id, taskId, attachmentId);
  if (!result.ok) {
    throw new Error("Attachment could not be removed.");
  }
  revalidatePath(`/projects/${result.projectId}/tasks/${taskId}`);
}
