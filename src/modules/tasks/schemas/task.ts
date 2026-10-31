import { z } from "zod";

import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
  TASK_TITLE_MIN_LENGTH,
} from "../constants";

const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]);
const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

const optionalUuid = z.preprocess(
  (value) => (value === null ? "" : value),
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .refine((value) => value === null || /^[0-9a-f-]{36}$/i.test(value), {
      message: "Select a valid assignee.",
    }),
);

const optionalDate = z.preprocess(
  (value) => (value === null ? "" : value),
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .refine((value) => value === null || !Number.isNaN(Date.parse(value)), {
      message: "Enter a valid due date.",
    }),
);

export const createTaskSchema = z.object({
  projectId: z.string().uuid("Select a valid project."),
  title: z
    .string()
    .trim()
    .min(
      TASK_TITLE_MIN_LENGTH,
      `Task title must be at least ${TASK_TITLE_MIN_LENGTH} characters.`,
    )
    .max(
      TASK_TITLE_MAX_LENGTH,
      `Task title must be ${TASK_TITLE_MAX_LENGTH} characters or fewer.`,
    ),
  description: z.preprocess(
    (value) => (value === null ? "" : value),
    z
      .string()
      .trim()
      .max(
        TASK_DESCRIPTION_MAX_LENGTH,
        `Description must be ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer.`,
      )
      .optional()
      .transform((value) => (value === "" || value === undefined ? null : value)),
  ),
  status: taskStatusSchema.default("TODO"),
  priority: taskPrioritySchema.default("MEDIUM"),
  assigneeId: optionalUuid,
  dueDate: optionalDate,
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      TASK_TITLE_MIN_LENGTH,
      `Task title must be at least ${TASK_TITLE_MIN_LENGTH} characters.`,
    )
    .max(
      TASK_TITLE_MAX_LENGTH,
      `Task title must be ${TASK_TITLE_MAX_LENGTH} characters or fewer.`,
    ),
  description: z.preprocess(
    (value) => (value === null ? "" : value),
    z
      .string()
      .trim()
      .max(
        TASK_DESCRIPTION_MAX_LENGTH,
        `Description must be ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer.`,
      )
      .optional()
      .transform((value) => (value === "" || value === undefined ? null : value)),
  ),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assigneeId: optionalUuid,
  dueDate: optionalDate,
});

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
});

export const taskFiltersSchema = z.object({
  search: z.string().trim().max(120).optional().default(""),
  status: z
    .union([taskStatusSchema, z.literal("ALL")])
    .optional()
    .default("ALL"),
  priority: z
    .union([taskPrioritySchema, z.literal("ALL")])
    .optional()
    .default("ALL"),
  assigneeId: z.string().trim().optional().default("ALL"),
  dueBefore: z.string().trim().optional().default(""),
  dueAfter: z.string().trim().optional().default(""),
  sortBy: z
    .enum(["createdAt", "dueDate", "priority", "title", "status"])
    .optional()
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;