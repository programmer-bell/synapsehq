import "server-only";

import { getEnv } from "@/src/shared/config/env";

import { signSessionToken } from "../lib/jwt";
import { verifyPassword } from "../lib/password";
import { hashRateLimitIdentifier } from "../lib/rate-limit-identifier";
import { toAuthUser } from "../lib/user";
import { createSessionRecord } from "../repositories/session-repository";
import { findUserByEmail } from "../repositories/user-repository";
import type { LoginInput } from "../schemas/auth";
import type { LoginResult } from "../types";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "./login-throttle-service";

const DUMMY_PASSWORD_HASH =
  "$2b$12$Tnb5OROwBcJ0pCqt4BAf4uEXS3bgrULeb5FBnayhDpUBWivQJRQ9W";

export async function loginUser(
  input: LoginInput,
  context: { ip: string },
): Promise<LoginResult> {
  const emailKey = hashRateLimitIdentifier("email", input.email);
  const ipKey = hashRateLimitIdentifier("ip", context.ip);
  const now = new Date();

  try {
    const [emailBlocked, ipBlocked] = await Promise.all([
      isLoginBlocked(emailKey, now),
      isLoginBlocked(ipKey, now),
    ]);

    if (emailBlocked || ipBlocked) {
      return { ok: false, code: "RATE_LIMITED" };
    }

    const user = await findUserByEmail(input.email);
    const passwordMatches = await verifyPassword(
      input.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches || user.status !== "ACTIVE") {
      await Promise.all([
        recordLoginFailure(emailKey, now),
        recordLoginFailure(ipKey, now),
      ]);

      return { ok: false, code: "INVALID_CREDENTIALS" };
    }

    await Promise.all([
      clearLoginFailures(emailKey),
      clearLoginFailures(ipKey),
    ]);

    const expiresAt = new Date(
      now.getTime() + getEnv().AUTH_SESSION_TTL_SECONDS * 1_000,
    );
    const session = await createSessionRecord({
      userId: user.id,
      expiresAt,
    });
    const token = await signSessionToken({
      userId: user.id,
      sessionId: session.id,
      expiresAt,
    });

    return {
      ok: true,
      user: toAuthUser(user),
      token,
      expiresAt,
    };
  } catch {
    return { ok: false, code: "UNKNOWN" };
  }
}
