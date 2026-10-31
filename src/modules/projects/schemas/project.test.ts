import { describe, expect, it } from "vitest";

import { createProjectSchema, updateProjectSchema } from "./project";

describe("project schemas", () => {
  it("accepts a valid project", () => {
    const result = createProjectSchema.safeParse({
      workspaceId: "550e8400-e29b-41d4-a716-446655440000",
      name: "API Gateway",
      description: "Core API",
      status: "ACTIVE",
    });

    expect(result.success).toBe(true);
  });

  it("rejects short project names", () => {
    expect(
      createProjectSchema.safeParse({
        workspaceId: "550e8400-e29b-41d4-a716-446655440000",
        name: "A",
        status: "ACTIVE",
      }).success,
    ).toBe(false);
  });

  it("converts empty descriptions to null", () => {
    const result = createProjectSchema.safeParse({
      workspaceId: "550e8400-e29b-41d4-a716-446655440000",
      name: "API Gateway",
      description: "   ",
      status: "ACTIVE",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });

  it("rejects invalid project statuses", () => {
    expect(
      updateProjectSchema.safeParse({
        name: "API Gateway",
        description: "",
        status: "DONE",
      }).success,
    ).toBe(false);
  });
});
