import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteLoginAttempt,
  findLoginAttempt,
  saveLoginAttempt,
} from "../repositories/login-attempt-repository";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "./login-throttle-service";

vi.mock("../repositories/login-attempt-repository", () => ({
  findLoginAttempt: vi.fn(),
  saveLoginAttempt: vi.fn(),
  deleteLoginAttempt: vi.fn(),
}));

const now = new Date("2026-01-01T12:00:00.000Z");

describe("login throttle service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(saveLoginAttempt).mockResolvedValue();
    vi.mocked(deleteLoginAttempt).mockResolvedValue();
  });

  it("records a first failure without blocking", async () => {
    vi.mocked(findLoginAttempt).mockResolvedValue(null);

    await recordLoginFailure("email:test", now);

    expect(saveLoginAttempt).toHaveBeenCalledWith({
      key: "email:test",
      failedCount: 1,
      windowStartedAt: now,
      blockedUntil: null,
      updatedAt: now,
    });
  });

  it("blocks after the fifth failure", async () => {
    vi.mocked(findLoginAttempt).mockResolvedValue({
      key: "email:test",
      failedCount: 4,
      windowStartedAt: new Date(now.getTime() - 60_000),
      blockedUntil: null,
      updatedAt: now,
    });

    await recordLoginFailure("email:test", now);

    expect(saveLoginAttempt).toHaveBeenCalledWith({
      key: "email:test",
      failedCount: 5,
      windowStartedAt: new Date(now.getTime() - 60_000),
      blockedUntil: new Date(now.getTime() + 15 * 60_000),
      updatedAt: now,
    });
  });

  it("starts a new window after the previous window expires", async () => {
    vi.mocked(findLoginAttempt).mockResolvedValue({
      key: "email:test",
      failedCount: 4,
      windowStartedAt: new Date(now.getTime() - 16 * 60_000),
      blockedUntil: null,
      updatedAt: now,
    });

    await recordLoginFailure("email:test", now);

    expect(saveLoginAttempt).toHaveBeenCalledWith({
      key: "email:test",
      failedCount: 1,
      windowStartedAt: now,
      blockedUntil: null,
      updatedAt: now,
    });
  });

  it("recognizes an active block", async () => {
    vi.mocked(findLoginAttempt).mockResolvedValue({
      key: "email:test",
      failedCount: 5,
      windowStartedAt: now,
      blockedUntil: new Date(now.getTime() + 60_000),
      updatedAt: now,
    });

    await expect(isLoginBlocked("email:test", now)).resolves.toBe(true);
  });

  it("does not treat an expired block as active", async () => {
    vi.mocked(findLoginAttempt).mockResolvedValue({
      key: "email:test",
      failedCount: 5,
      windowStartedAt: now,
      blockedUntil: new Date(now.getTime() - 60_000),
      updatedAt: now,
    });

    await expect(isLoginBlocked("email:test", now)).resolves.toBe(false);
  });

  it("clears failures", async () => {
    await clearLoginFailures("email:test");

    expect(deleteLoginAttempt).toHaveBeenCalledWith("email:test");
  });
});
