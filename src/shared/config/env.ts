import "server-only";

import { envSchema, type ServerEnv } from "./env.schema";

let cachedEnv: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    AUTH_SESSION_TTL_SECONDS: process.env.AUTH_SESSION_TTL_SECONDS,
  });

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}
