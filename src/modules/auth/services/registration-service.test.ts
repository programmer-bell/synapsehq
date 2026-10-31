import { beforeEach, describe, expect, it, vi } from "vitest";

import { hashPassword } from "../lib/password";
import { createUser, findUserByEmail } from "../repositories/user-repository";
import { registerUser } from "./registration-service";

vi.mock("../lib/password", () => ({
  hashPassword: vi.fn(),
}));

vi.mock("../repositories/user-repository", () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));

const input = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "correct-password",
  confirmPassword: "correct-password",
};

const userRecord = {
  id: "user-id",
  name: input.name,
  email: input.email,
  passwordHash: "hashed-password",
  status: "ACTIVE" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("registration service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hashPassword).mockResolvedValue("hashed-password");
    vi.mocked(createUser).mockResolvedValue(userRecord);
  });

  it("rejects an existing email", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(userRecord);

    await expect(registerUser(input)).resolves.toEqual({
      ok: false,
      code: "EMAIL_TAKEN",
    });
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it("creates a user with a hashed password", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null);

    await expect(registerUser(input)).resolves.toEqual({
      ok: true,
      user: {
        id: "user-id",
        name: input.name,
        email: input.email,
      },
    });
    expect(createUser).toHaveBeenCalledWith({
      name: input.name,
      email: input.email,
      passwordHash: "hashed-password",
    });
  });

  it("maps a unique violation to a taken email", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null);
    vi.mocked(createUser).mockRejectedValue({ code: "23505" });

    await expect(registerUser(input)).resolves.toEqual({
      ok: false,
      code: "EMAIL_TAKEN",
    });
  });

  it("returns an unknown failure for unexpected errors", async () => {
    vi.mocked(findUserByEmail).mockRejectedValue(new Error("database down"));

    await expect(registerUser(input)).resolves.toEqual({
      ok: false,
      code: "UNKNOWN",
    });
  });
});
