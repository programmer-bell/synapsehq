import { describe, expect, it } from "vitest";

import {
  canCreateTasks,
  canDeleteTask,
  canReadTasks,
  canUpdateTask,
} from "./permissions";

describe("task permissions", () => {
  it("allows readers to read and create tasks", () => {
    expect(canReadTasks("MEMBER")).toBe(true);
    expect(canCreateTasks("MEMBER")).toBe(true);
  });

  it("allows project updaters to update any task", () => {
    expect(canUpdateTask("ADMIN", "owner", null, "member")).toBe(true);
  });

  it("allows creators and assignees to update their tasks", () => {
    expect(canUpdateTask("MEMBER", "creator", null, "creator")).toBe(true);
    expect(canUpdateTask("MEMBER", "owner", "assignee", "assignee")).toBe(true);
    expect(canUpdateTask("MEMBER", "owner", "other", "member")).toBe(false);
  });

  it("allows deletion by project deleters or creators", () => {
    expect(canDeleteTask("ADMIN", "creator", "member")).toBe(true);
    expect(canDeleteTask("MEMBER", "creator", "creator")).toBe(true);
    expect(canDeleteTask("MEMBER", "creator", "member")).toBe(false);
  });
});
