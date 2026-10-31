import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { closeDb, db } from "@/src/shared/db";

import { authLoginAttempts, users } from "../db/schema";
import { signSessionToken } from "../lib/jwt";
import {
  createSessionRecord,
  revokeSessionRecord,
} from "../repositories/session-repository";
import { findUserByEmail } from "../repositories/user-repository";
import { loginUser } from "./login-service";
import { registerUser } from "./registration-service";
import { resolveSessionToken, revokeSessionByToken } from "./session-service";

const describeIntegration = process.env.TEST_DATABASE_URL
  ? describe
  : describe.skip;

const signupInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "correct-password",
  confirmPassword: "correct-password",
};

describeIntegration("auth database integration", () => {
  beforeEach(async () => {
    await db.delete(authLoginAttempts);
    await db.delete(users);
  });

  afterAll(async () => {
    await closeDb();
  });

  it("registers a user with a hashed password", async () => {
    const result = await registerUser(signupInput);

    expect(result.ok).toBe(true);

    const user = await findUserByEmail(signupInput.email);

    expect(user).not.toBeNull();
    expect(user?.passwordHash).not.toBe(signupInput.password);
    expect(user?.status).toBe("ACTIVE");
  });

  it("rejects a duplicate email", async () => {
    await registerUser(signupInput);

    await expect(registerUser(signupInput)).resolves.toEqual({
      ok: false,
      code: "EMAIL_TAKEN",
    });
  });

  it("logs in, resolves the session, and rejects it after revocation", async () => {
    await registerUser(signupInput);

    const login = await loginUser(
      {
        email: signupInput.email,
        password: signupInput.password,
      },
      { ip: "203.0.113.10" },
    );

    expect(login.ok).toBe(true);

    if (!login.ok) {
      return;
    }

    await expect(resolveSessionToken(login.token)).resolves.toMatchObject({
      email: signupInput.email,
    });

    await revokeSessionByToken(login.token);

    await expect(resolveSessionToken(login.token)).resolves.toBeNull();
  });

  it("rejects expired persistent sessions", async () => {
    await registerUser(signupInput);

    const user = await findUserByEmail(signupInput.email);

    if (!user) {
      throw new Error("Expected the registered user to exist.");
    }

    const expiresAt = new Date(Date.now() - 60_000);
    const session = await createSessionRecord({
      userId: user.id,
      expiresAt,
    });
    const token = await signSessionToken({
      userId: user.id,
      sessionId: session.id,
      expiresAt,
    });

    await expect(resolveSessionToken(token)).resolves.toBeNull();
  });

  it("rejects revoked persistent sessions", async () => {
    await registerUser(signupInput);

    const user = await findUserByEmail(signupInput.email);

    if (!user) {
      throw new Error("Expected the registered user to exist.");
    }

    const expiresAt = new Date(Date.now() + 60_000);
    const session = await createSessionRecord({
      userId: user.id,
      expiresAt,
    });
    const token = await signSessionToken({
      userId: user.id,
      sessionId: session.id,
      expiresAt,
    });

    await revokeSessionRecord(session.id);

    await expect(resolveSessionToken(token)).resolves.toBeNull();
  });

  it("blocks login after repeated failed attempts", async () => {
    await registerUser(signupInput);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        loginUser(
          { email: signupInput.email, password: "wrong-password" },
          { ip: "203.0.113.11" },
        ),
      ).resolves.toEqual({
        ok: false,
        code: "INVALID_CREDENTIALS",
      });
    }

    await expect(
      loginUser(
        { email: signupInput.email, password: signupInput.password },
        { ip: "203.0.113.11" },
      ),
    ).resolves.toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
  });
});
