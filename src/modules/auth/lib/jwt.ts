import "server-only";

import { jwtVerify, SignJWT } from "jose";

import { getEnv } from "@/src/shared/config/env";

import { JWT_ALGORITHM, JWT_AUDIENCE, JWT_ISSUER } from "../constants";

export type SessionTokenPayload = {
  userId: string;
  sessionId: string;
};

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(getEnv().JWT_SECRET);
}

export function signSessionToken(input: {
  userId: string;
  sessionId: string;
  expiresAt: Date;
}): Promise<string> {
  return new SignJWT({ sid: input.sessionId })
    .setProtectedHeader({ alg: JWT_ALGORITHM, typ: "JWT" })
    .setSubject(input.userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(input.expiresAt.getTime() / 1000))
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (typeof payload.sub !== "string" || typeof payload.sid !== "string") {
      return null;
    }

    return {
      userId: payload.sub,
      sessionId: payload.sid,
    };
  } catch {
    return null;
  }
}
