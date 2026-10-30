import { z } from "zod";

import {
  WORKSPACE_NAME_MAX_LENGTH,
  WORKSPACE_NAME_MIN_LENGTH,
} from "../constants";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      WORKSPACE_NAME_MIN_LENGTH,
      `Workspace name must be at least ${WORKSPACE_NAME_MIN_LENGTH} characters.`,
    )
    .max(
      WORKSPACE_NAME_MAX_LENGTH,
      `Workspace name must be ${WORKSPACE_NAME_MAX_LENGTH} characters or fewer.`,
    ),
});

export const updateWorkspaceSchema = createWorkspaceSchema;

export const addWorkspaceMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(320, "Email must be 320 characters or fewer."),
  role: z.enum(["ADMIN", "MEMBER"], {
    message: "Select a valid member role.",
  }),
});

export const removeWorkspaceMemberSchema = z.object({
  userId: z.string().uuid("Select a valid member."),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>;