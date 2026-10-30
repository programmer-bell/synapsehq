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
});
