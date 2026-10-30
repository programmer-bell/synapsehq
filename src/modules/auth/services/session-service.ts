import "server-only";

import { redirect } from "next/navigation";

import {
  clearSessionCookie,
  readSessionCookie,
} from "../lib/cookies";
import { verifySessionToken } from "../lib/jwt";
import { toAuthUser } from "../lib/user";
import {
  findSessionWithUser,
  revokeSessionRecord,
} from "../repositories/session-repository";
import type { AuthUser } from "../types";

export async function resolveSessionToken(
  token: string,
): Promise<AuthUser | null> {
  const payload = await verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const record = await findSessionWithUser(payload.sessionId);

  if (!record) {
    return null;
  }

  if (record.session.userId !== payload.userId) {
    return null;
  }

  if (record.session.revokedAt) {
    return null;
  }

  if (record.session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  if (record.user.status !== "ACTIVE") {
    return null;
  }

  return toAuthUser(record.user);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await readSessionCookie();

  if (!token) {
    return null;
  }

  return resolveSessionToken(token);
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function revokeSessionByToken(token: string): Promise<void> {
  const payload = await verifySessionToken(token);

  if (!payload) {
    return;
  }

  await revokeSessionRecord(payload.sessionId);
}

export async function logoutCurrentSession(): Promise<void> {
  const token = await readSessionCookie();

  if (token) {
    await revokeSessionByToken(token);
  }

  await clearSessionCookie();
}
