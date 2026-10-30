import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password utilities", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("correct-password");

    expect(hash).toMatch(/^\$2b\$12\$/);
    await expect(verifyPassword("correct-password", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-password");

    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
