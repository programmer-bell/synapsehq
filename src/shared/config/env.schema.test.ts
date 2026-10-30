import { describe, expect, it } from "vitest";

import { envSchema } from "./env.schema";

const validEnv = {
  DATABASE_URL: "postgresql://user:password@localhost:5432/synapsehq",
  JWT_SECRET: "a".repeat(32),
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

describe("envSchema", () => {
  it("accepts a valid environment", () => {
    expect(envSchema.safeParse(validEnv).success).toBe(true);
  });

  it("rejects a missing database URL", () => {
    expect(
      envSchema.safeParse({ ...validEnv, DATABASE_URL: undefined }).success,
    ).toBe(false);
  });

  it("rejects a non-PostgreSQL database URL", () => {
    expect(
      envSchema.safeParse({
        ...validEnv,
        DATABASE_URL: "mysql://localhost/synapsehq",
      }).success,
    ).toBe(false);
  });

  it("rejects a short JWT secret", () => {
    expect(
      envSchema.safeParse({ ...validEnv, JWT_SECRET: "short" }).success,
    ).toBe(false);
  });

  it("rejects an invalid application URL", () => {
    expect(
      envSchema.safeParse({
        ...validEnv,
        NEXT_PUBLIC_APP_URL: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("defaults the auth session lifetime to seven days", () => {
    const result = envSchema.safeParse(validEnv);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.AUTH_SESSION_TTL_SECONDS).toBe(604_800);
    }
  });

  it("rejects an auth session lifetime below five minutes", () => {
    expect(
      envSchema.safeParse({
        ...validEnv,
        AUTH_SESSION_TTL_SECONDS: "60",
      }).success,
    ).toBe(false);
  });
});
