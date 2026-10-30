import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "./auth";

const validSignup = {
  name: "Ada Lovelace",
  email: "  Ada@Example.COM ",
  password: "correct-password",
  confirmPassword: "correct-password",
};

describe("signupSchema", () => {
  it("normalizes valid signup input", () => {
    const result = signupSchema.safeParse(validSignup);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
      expect(result.data.name).toBe("Ada Lovelace");
    }
  });

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      confirmPassword: "different-password",
    });

    expect(result.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: "short",
      confirmPassword: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects passwords longer than 72 bytes", () => {
    const password = "é".repeat(37);

    const result = signupSchema.safeParse({
      ...validSignup,
      password,
      confirmPassword: password,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("normalizes a valid login email", () => {
    const result = loginSchema.safeParse({
      email: "  Ada@Example.COM ",
      password: "password",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});
