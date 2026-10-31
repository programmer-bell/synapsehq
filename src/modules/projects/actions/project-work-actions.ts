"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/src/modules/auth";
import {
  addProjectTeamMember,
  createProjectMilestone,
  removeProjectTeamMember,
  updateProjectMilestoneStatus,
} from "../services/project-work-service";

export async function addProjectMemberAction(
  projectId: string,
  _previousState: { status: "idle" | "error" | "success"; message?: string },
  formData: FormData,
): Promise<{ status: "idle" | "error" | "success"; message?: string }> {
  const user = await requireUser();
  const result = await addProjectTeamMember(user.id, projectId, {
    userId: String(formData.get("userId") ?? ""),
    allocationPercent: formData.get("allocationPercent"),
  });
  if (!result.ok) {
    return {
      status: "error",
      message:
        result.code === "NOT_WORKSPACE_MEMBER"
          ? "Choose a member of this project’s workspace."
          : result.code === "ALREADY_MEMBER"
            ? "This person is already on the project."
            : "Could not add this project member.",
    };
  }
  revalidatePath(`/projects/${projectId}`);
  return { status: "success", message: "Project member added." };
}

export async function removeProjectMemberAction(
  projectId: string,
  _previousState: { status: "idle" | "error" | "success"; message?: string },
  formData: FormData,
): Promise<{ status: "idle" | "error" | "success"; message?: string }> {
  const user = await requireUser();
  const targetUserId = String(formData.get("userId") ?? "");
  if (!z.string().uuid().safeParse(targetUserId).success) {
    return { status: "error", message: "Choose a valid project member." };
  }
  const result = await removeProjectTeamMember(
    user.id,
    projectId,
    targetUserId,
  );
  if (!result.ok) {
    return {
      status: "error",
      message: "Could not remove this project member.",
    };
  }
  revalidatePath(`/projects/${projectId}`);
  return { status: "success", message: "Project member removed." };
}

export async function createProjectMilestoneAction(
  _previousState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const result = await createProjectMilestone(user.id, {
    projectId,
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    dueDate: String(formData.get("dueDate") ?? ""),
  });
  if (!result.ok) {
    return {
      error:
        result.code === "FORBIDDEN"
          ? "You cannot manage milestones for this project."
          : "Milestone could not be created.",
    };
  }
  revalidatePath(`/projects/${projectId}/milestones`);
  redirect(`/projects/${projectId}/milestones`);
}

export async function updateMilestoneStatusAction(
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const result = await updateProjectMilestoneStatus(user.id, {
    milestoneId: String(formData.get("milestoneId") ?? ""),
    status: String(formData.get("status") ?? ""),
  });
  if (!result.ok) {
    throw new Error("Milestone status could not be updated.");
  }
  revalidatePath(`/projects/${result.data.projectId}/milestones`);
}
