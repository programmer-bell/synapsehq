import "server-only";

import { createHmac } from "node:crypto";

import { getEnv } from "@/src/shared/config/env";

export type RateLimitIdentifierType = "email" | "ip";

export function hashRateLimitIdentifier(
  type: RateLimitIdentifierType,
  value: string,
): string {
  return createHmac("sha256", getEnv().JWT_SECRET)
    .update(`${type}:${value}`)
    .digest("hex");
}
