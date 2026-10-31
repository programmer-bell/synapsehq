import { z } from "zod";

import { PASSWORD_MAX_BYTES, PASSWORD_MIN_LENGTH } from "../constants";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(320, "Email must be 320 characters or fewer.");

const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
  )
  .refine(
    (value) => new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES,
    `Password must be ${PASSWORD_MAX_BYTES} bytes or fewer.`,
  );

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(120, "Name must be 120 characters or fewer."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required.")
    .refine(
      (value) => new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES,
      `Password must be ${PASSWORD_MAX_BYTES} bytes or fewer.`,
    ),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
