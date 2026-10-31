import { describe, expect, it } from "vitest";

import { createTaskSchema, taskFiltersSchema, updateTaskSchema } from "./task";

describe("task schemas", () => {
  it("accepts a valid task", () => {
    const result = createTaskSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Implement login",
      description: "Add auth",
      status: "TODO",
      priority: "HIGH",
      assigneeId: "",
      dueDate: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.assigneeId).toBeNull();
      expect(result.data.dueDate).toBeNull();
    }
  });

  it("rejects short titles", () => {
    expect(
      createTaskSchema.safeParse({
        projectId: "550e8400-e29b-41d4-a716-446655440000",
        title: "A",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        dueDate: "",
      }).success,
    ).toBe(false);
  });

  it("validates filters", () => {
    const result = taskFiltersSchema.safeParse({
      search: "auth",
      status: "DONE",
      priority: "HIGH",
      assigneeId: "UNASSIGNED",
      sortBy: "dueDate",
      sortDirection: "asc",
      page: "2",
      pageSize: "10",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.pageSize).toBe(10);
    }
  });

  it("rejects invalid statuses on update", () => {
    expect(
      updateTaskSchema.safeParse({
        title: "Task",
        description: "",
        status: "BLOCKED",
        priority: "MEDIUM",
        assigneeId: "",
        dueDate: "",
      }).success,
    ).toBe(false);
  });
});
