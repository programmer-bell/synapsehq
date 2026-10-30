import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (value) =>
        value.startsWith("postgres://") || value.startsWith("postgresql://"),
      "DATABASE_URL must be a PostgreSQL connection string",
    ),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  AUTH_SESSION_TTL_SECONDS: z.coerce
    .number()
    .int("AUTH_SESSION_TTL_SECONDS must be an integer")
    .min(300, "AUTH_SESSION_TTL_SECONDS must be at least 300 seconds")
    .max(
      2_592_000,
      "AUTH_SESSION_TTL_SECONDS must be no more than 30 days",
    )
    .default(604_800),
});

export type ServerEnv = z.infer<typeof envSchema>;
