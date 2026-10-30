"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/src/modules/auth";
import {
  createProject,
  deleteProject,
  updateProject,
} from "../services/project-service";
import { createProjectSchema, updateProjectSchema } from "../schemas/project";
import type { ProjectFormState } from "../types";

function toFieldErrors(error: z.ZodError) {
  const fieldErrors = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([, messages]) => messages && messages.length > 0),
  );
}

export async function createProjectAction(
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const user = await requireUser();
  const parsed = createProjectSchema.safeParse({
    workspaceId: String(formData.get("workspaceId") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const result = await createProject(user.id, parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message:
        result.code === "FORBIDDEN"
          ? "You do not have permission to create projects in this workspace."
          : result.code === "WORKSPACE_NOT_FOUND"
            ? "Workspace not found."
            : "We could not create the project. Please try again.",
    };
  }

  revalidatePath(`/workspaces/${parsed.data.workspaceId}`);
  revalidatePath("/dashboard");
  redirect(`/projects/${result.data.id}`);
}

export async function updateProjectAction(
  projectId: string,
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const user = await requireUser();
  const parsed = updateProjectSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const result = await updateProject(user.id, projectId, parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message:
        result.code === "FORBIDDEN"
          ? "You do not have permission to update this project."
          : result.code === "NOT_FOUND"
            ? "Project not found."
            : "We could not update the project. Please try again.",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { status: "success", message: "Project updated." };
}

export async function deleteProjectAction(
  projectId: string,
  formData: FormData,
): Promise<void> {
  void formData;
  const user = await requireUser();
  const result = await deleteProject(user.id, projectId);

  if (!result.ok) {
    return;
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}