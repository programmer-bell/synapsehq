"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/src/modules/auth";
import {
  createWorkspace,
  deleteWorkspace,
  updateWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
} from "../services/workspace-service";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
} from "../schemas/workspace";
import type { WorkspaceFormState, WorkspaceMemberActionState } from "../types";

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

export async function createWorkspaceAction(
  _previousState: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const user = await requireUser();
  const parsed = createWorkspaceSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const result = await createWorkspace(user.id, parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message:
        result.code === "INVALID_INPUT"
          ? "Please correct the highlighted fields."
          : "We could not create the workspace. Please try again.",
    };
  }

  revalidatePath("/workspaces");
  revalidatePath("/dashboard");
  redirect(`/workspaces/${result.data.id}`);
}

export async function updateWorkspaceAction(
  workspaceId: string,
  _previousState: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const user = await requireUser();
  const parsed = updateWorkspaceSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const result = await updateWorkspace(user.id, workspaceId, parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message:
        result.code === "FORBIDDEN"
          ? "You do not have permission to update this workspace."
          : result.code === "NOT_FOUND"
            ? "Workspace not found."
            : "We could not update the workspace. Please try again.",
    };
  }

  revalidatePath(`/workspaces/${workspaceId}`);
  revalidatePath("/workspaces");
  return { status: "success", message: "Workspace updated." };
}

export async function deleteWorkspaceAction(
  workspaceId: string,
  formData: FormData,
): Promise<void> {
  void formData;
  const user = await requireUser();
  const result = await deleteWorkspace(user.id, workspaceId);

  if (!result.ok) {
    return;
  }

  revalidatePath("/workspaces");
  revalidatePath("/dashboard");
  redirect("/workspaces");
}

export async function addWorkspaceMemberAction(
  workspaceId: string,
  _previousState: WorkspaceMemberActionState,
  formData: FormData,
): Promise<WorkspaceMemberActionState> {
  const user = await requireUser();
  const parsed = addWorkspaceMemberSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
    };
  }

  const result = await addWorkspaceMember(user.id, workspaceId, parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message:
        result.code === "FORBIDDEN"
          ? "You do not have permission to manage members."
          : result.code === "USER_NOT_FOUND"
            ? "No user exists with that email."
            : result.code === "ALREADY_MEMBER"
              ? "That user is already a member."
              : "We could not add the member. Please try again.",
    };
  }

  revalidatePath(`/workspaces/${workspaceId}`);
  return { status: "success", message: "Member added." };
}

export async function removeWorkspaceMemberAction(
  workspaceId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const targetUserId = String(formData.get("userId") ?? "");
  const result = await removeWorkspaceMember(
    user.id,
    workspaceId,
    targetUserId,
  );

  if (!result.ok) {
    return;
  }

  revalidatePath(`/workspaces/${workspaceId}`);
}
