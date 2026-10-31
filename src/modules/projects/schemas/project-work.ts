import { z } from "zod";

export const addProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  allocationPercent: z.coerce.number().int().min(1).max(100),
});

export const createMilestoneSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).nullable(),
  dueDate: z
    .string()
    .trim()
    .transform((value) => (value ? new Date(value) : null))
    .refine((value) => value === null || !Number.isNaN(value.getTime())),
});

export const updateMilestoneStatusSchema = z.object({
  milestoneId: z.string().uuid(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED"]),
});
