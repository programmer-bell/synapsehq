import "server-only";

import {
  LOGIN_BLOCK_SECONDS,
  LOGIN_MAX_FAILURES,
  LOGIN_WINDOW_SECONDS,
} from "../constants";
import {
  deleteLoginAttempt,
  findLoginAttempt,
  saveLoginAttempt,
} from "../repositories/login-attempt-repository";

const WINDOW_MS = LOGIN_WINDOW_SECONDS * 1_000;
const BLOCK_MS = LOGIN_BLOCK_SECONDS * 1_000;

export async function isLoginBlocked(
  key: string,
  now: Date = new Date(),
): Promise<boolean> {
  const attempt = await findLoginAttempt(key);
  return Boolean(attempt?.blockedUntil && attempt.blockedUntil > now);
}

export async function recordLoginFailure(
  key: string,
  now: Date = new Date(),
): Promise<void> {
  const existing = await findLoginAttempt(key);

  let windowStartedAt = existing?.windowStartedAt ?? now;
  let failedCount = existing?.failedCount ?? 0;

  if (existing?.blockedUntil && existing.blockedUntil <= now) {
    windowStartedAt = now;
    failedCount = 0;
  }

  if (now.getTime() - windowStartedAt.getTime() >= WINDOW_MS) {
    windowStartedAt = now;
    failedCount = 0;
  }

  failedCount += 1;

  await saveLoginAttempt({
    key,
    failedCount,
    windowStartedAt,
    blockedUntil:
      failedCount >= LOGIN_MAX_FAILURES
        ? new Date(now.getTime() + BLOCK_MS)
        : null,
    updatedAt: now,
  });
}

export async function clearLoginFailures(key: string): Promise<void> {
  await deleteLoginAttempt(key);
}
