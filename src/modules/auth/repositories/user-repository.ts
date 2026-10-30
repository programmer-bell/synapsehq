import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/src/shared/db";

import { users, type UserRecord } from "../db/schema";

export function findUserByEmail(email: string): Promise<UserRecord | null> {
  return db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export function findUserById(id: string): Promise<UserRecord | null> {
  return db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<UserRecord> {
  const [user] = await db.insert(users).values(input).returning();
  return user;
}
