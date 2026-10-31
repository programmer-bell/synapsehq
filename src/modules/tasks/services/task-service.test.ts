import { beforeEach, describe, expect, it, vi } from "vitest";

import { getTaskAccess } from "./task-service";

vi.mock("@/src/modules/projects", () => ({
  getProjectAccess: vi.fn(),
}));

vi.mock("@/src/modules/workspaces", () => ({
  getWorkspaceAccess: vi.fn(),
  listWorkspaceMembers: vi.fn(),
  hasWorkspacePermission: vi.fn().mockReturnValue(true),
}));

vi.mock("../repositories/task-repository", () => ({
  findTaskById: vi.fn(),
  listTasksByProject: vi.fn(),
  createTaskRecord: vi.fn(),
  updateTaskRecord: vi.fn(),
  updateTaskStatusRecord: vi.fn(),
  deleteTaskRecord: vi.fn(),
}));

import { getProjectAccess } from "@/src/modules/projects";
import { findTaskById } from "../repositories/task-repository";

describe("task service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when the task does not exist", async () => {
    vi.mocked(findTaskById).mockResolvedValue(null);

    await expect(getTaskAccess("user-1", "task-1")).resolves.toBeNull();
  });

  it("returns null when project access is missing", async () => {
    vi.mocked(findTaskById).mockResolvedValue({
      id: "task-1",
      projectId: "project-1",
      title: "Task",
      description: null,
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: null,
      dueDate: null,
      createdBy: "owner-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getProjectAccess).mockResolvedValue(null);

    await expect(getTaskAccess("user-1", "task-1")).resolves.toBeNull();
  });

  it("returns task access for a permitted project member", async () => {
    vi.mocked(findTaskById).mockResolvedValue({
      id: "task-1",
      projectId: "project-1",
      title: "Task",
      description: null,
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: null,
      dueDate: null,
      createdBy: "owner-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getProjectAccess).mockResolvedValue({
      project: { id: "project-1" } as never,
      workspaceId: "workspace-1",
      role: "MEMBER",
      createdBy: "owner-1",
    });

    await expect(getTaskAccess("user-1", "task-1")).resolves.toMatchObject({
      task: { id: "task-1" },
      role: "MEMBER",
    });
  });
});