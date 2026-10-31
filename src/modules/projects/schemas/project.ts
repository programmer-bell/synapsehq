import { z } from "zod";

import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_NAME_MIN_LENGTH,
} from "../constants";

export const projectStatusSchema = z.enum(["ACTIVE", "ARCHIVED"]);

export const createProjectSchema = z.object({
  workspaceId: z.string().uuid("Select a valid workspace."),
  name: z
    .string()
    .trim()
    .min(
      PROJECT_NAME_MIN_LENGTH,
      `Project name must be at least ${PROJECT_NAME_MIN_LENGTH} characters.`,
    )
    .max(
      PROJECT_NAME_MAX_LENGTH,
      `Project name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer.`,
    ),
  description: z.preprocess(
    (value) => (value === null ? "" : value),
    z
      .string()
      .trim()
      .max(
        PROJECT_DESCRIPTION_MAX_LENGTH,
        `Description must be ${PROJECT_DESCRIPTION_MAX_LENGTH} characters or fewer.`,
      )
      .optional()
      .transform((value) => (value === "" ? null : (value ?? null))),
  ),
  status: projectStatusSchema.default("ACTIVE"),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      PROJECT_NAME_MIN_LENGTH,
      `Project name must be at least ${PROJECT_NAME_MIN_LENGTH} characters.`,
    )
    .max(
      PROJECT_NAME_MAX_LENGTH,
      `Project name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer.`,
    ),
  description: z.preprocess(
    (value) => (value === null ? "" : value),
    z
      .string()
      .trim()
      .max(
        PROJECT_DESCRIPTION_MAX_LENGTH,
        `Description must be ${PROJECT_DESCRIPTION_MAX_LENGTH} characters or fewer.`,
      )
      .optional()
      .transform((value) => (value === "" ? null : (value ?? null))),
  ),
  status: projectStatusSchema,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
