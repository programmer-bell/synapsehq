import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signSessionToken } from "../lib/jwt";
import { verifyPassword } from "../lib/password";
import { createSessionRecord } from "../repositories/session-repository";
import { findUserByEmail } from "../repositories/user-repository";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "./login-throttle-service";
import { loginUser } from "./login-service";

vi.mock("../lib/jwt", () => ({
  signSessionToken: vi.fn(),
}));

vi.mock("../lib/password", () => ({
  verifyPassword: vi.fn(),
}));

vi.mock("../repositories/session-repository", () => ({
  createSessionRecord: vi.fn(),
}));

vi.mock("../repositories/user-repository", () => ({
  findUserByEmail: vi.fn(),
}));

vi.mock("./login-throttle-service", () => ({
  isLoginBlocked: vi.fn(),
  recordLoginFailure: vi.fn(),
  clearLoginFailures: vi.fn(),
}));

const now = new Date("2026-01-01T12:00:00.000Z");

const input = {
  email: "ada@example.com",
  password: "correct-password",
};

const userRecord = {
  id: "user-id",
  name: "Ada Lovelace",
  email: input.email,
  passwordHash: "hashed-password",
  status: "ACTIVE" as const,
  createdAt: now,
  updatedAt: now,
};

const sessionRecord = {
  id: "session-id",
  userId: userRecord.id,
  expiresAt: new Date(now.getTime() + 604_800_000),
  revokedAt: null,
  createdAt: now,
};

describe("login service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    vi.clearAllMocks();
    vi.mocked(isLoginBlocked).mockResolvedValue(false);
    vi.mocked(recordLoginFailure).mockResolvedValue();
    vi.mocked(clearLoginFailures).mockResolvedValue();
    vi.mocked(findUserByEmail).mockResolvedValue(userRecord);
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(createSessionRecord).mockResolvedValue(sessionRecord);
    vi.mocked(signSessionToken).mockResolvedValue("signed-token");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("issues a session for valid credentials", async () => {
    await expect(loginUser(input, { ip: "127.0.0.1" })).resolves.toEqual({
      ok: true,
      user: {
        id: "user-id",
        name: "Ada Lovelace",
        email: input.email,
      },
      token: "signed-token",
      expiresAt: sessionRecord.expiresAt,
    });

    expect(createSessionRecord).toHaveBeenCalledWith({
      userId: "user-id",
      expiresAt: sessionRecord.expiresAt,
    });
    expect(signSessionToken).toHaveBeenCalledWith({
      userId: "user-id",
      sessionId: "session-id",
      expiresAt: sessionRecord.expiresAt,
    });
    expect(clearLoginFailures).toHaveBeenCalledTimes(2);
  });

  it("returns a generic failure for invalid credentials", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(loginUser(input, { ip: "127.0.0.1" })).resolves.toEqual({
      ok: false,
      code: "INVALID_CREDENTIALS",
    });

    expect(recordLoginFailure).toHaveBeenCalledTimes(2);
    expect(createSessionRecord).not.toHaveBeenCalled();
  });

  it("rejects disabled users without creating a session", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      ...userRecord,
      status: "DISABLED",
    });

    await expect(loginUser(input, { ip: "127.0.0.1" })).resolves.toEqual({
      ok: false,
      code: "INVALID_CREDENTIALS",
    });

    expect(createSessionRecord).not.toHaveBeenCalled();
  });

  it("rejects a blocked email or IP before checking credentials", async () => {
    vi.mocked(isLoginBlocked)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await expect(loginUser(input, { ip: "127.0.0.1" })).resolves.toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });

    expect(findUserByEmail).not.toHaveBeenCalled();
  });

  it("returns an unknown failure for unexpected errors", async () => {
    vi.mocked(findUserByEmail).mockRejectedValue(new Error("database down"));

    await expect(loginUser(input, { ip: "127.0.0.1" })).resolves.toEqual({
      ok: false,
      code: "UNKNOWN",
    });
  });
});
