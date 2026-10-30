import { describe, expect, it } from "vitest";

import { addWorkspaceMemberSchema, createWorkspaceSchema } from "./workspace";

describe("workspace schemas", () => {
  it("accepts a valid workspace name", () => {
    expect(createWorkspaceSchema.safeParse({ name: "Engineering" }).success).toBe(true);
  });

  it("rejects short workspace names", () => {
    expect(createWorkspaceSchema.safeParse({ name: "A" }).success).toBe(false);
  });

  it("normalizes member emails", () => {
    const result = addWorkspaceMemberSchema.safeParse({
      email: "  Member@Example.com ",
      role: "MEMBER",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("member@example.com");
    }
  });

  it("rejects invalid member roles", () => {
    expect(
      addWorkspaceMemberSchema.safeParse({ email: "member@example.com", role: "OWNER" }).success,
    ).toBe(false);
  });
});