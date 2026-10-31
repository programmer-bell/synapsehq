import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/src/shared/db";

import { authLoginAttempts, type AuthLoginAttemptRecord } from "../db/schema";

export function findLoginAttempt(
  key: string,
): Promise<AuthLoginAttemptRecord | null> {
  return db
    .select()
    .from(authLoginAttempts)
    .where(eq(authLoginAttempts.key, key))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export async function saveLoginAttempt(input: {
  key: string;
  failedCount: number;
  windowStartedAt: Date;
  blockedUntil: Date | null;
  updatedAt: Date;
}): Promise<void> {
  await db
    .insert(authLoginAttempts)
    .values(input)
    .onConflictDoUpdate({
      target: authLoginAttempts.key,
      set: {
        failedCount: input.failedCount,
        windowStartedAt: input.windowStartedAt,
        blockedUntil: input.blockedUntil,
        updatedAt: input.updatedAt,
      },
    });
}

export async function deleteLoginAttempt(key: string): Promise<void> {
  await db.delete(authLoginAttempts).where(eq(authLoginAttempts.key, key));
}
