import { describe, expect, it } from "vitest";

import { signSessionToken, verifySessionToken } from "./jwt";

describe("JWT utilities", () => {
  it("signs and verifies a session token", async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const token = await signSessionToken({
      userId: "user-id",
      sessionId: "session-id",
      expiresAt,
    });

    await expect(verifySessionToken(token)).resolves.toEqual({
      userId: "user-id",
      sessionId: "session-id",
    });
  });

  it("rejects an expired token", async () => {
    const token = await signSessionToken({
      userId: "user-id",
      sessionId: "session-id",
      expiresAt: new Date(Date.now() - 60_000),
    });

    await expect(verifySessionToken(token)).resolves.toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken({
      userId: "user-id",
      sessionId: "session-id",
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(verifySessionToken(`${token}tampered`)).resolves.toBeNull();
  });
});
