import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/src/shared/db";

import {
  sessions,
  users,
  type SessionRecord,
  type UserRecord,
} from "../db/schema";

export type SessionWithUser = {
  session: SessionRecord;
  user: UserRecord;
};

export async function createSessionRecord(input: {
  userId: string;
  expiresAt: Date;
}): Promise<SessionRecord> {
  const [session] = await db.insert(sessions).values(input).returning();
  return session;
}

export async function findSessionWithUser(
  sessionId: string,
): Promise<SessionWithUser | null> {
  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  return rows[0] ?? null;
}

export async function revokeSessionRecord(sessionId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.id, sessionId));
}
