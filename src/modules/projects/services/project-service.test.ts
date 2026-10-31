import { beforeEach, describe, expect, it, vi } from "vitest";

import { getProjectAccess } from "./project-service";

vi.mock("@/src/modules/workspaces", () => ({
  getWorkspaceAccess: vi.fn(),
  hasWorkspacePermission: vi.fn(),
  canManageProject: vi.fn(),
  canDeleteProject: vi.fn(),
}));

vi.mock("../repositories/project-repository", () => ({
  findProjectById: vi.fn(),
  listProjectsByWorkspace: vi.fn(),
  createProjectRecord: vi.fn(),
  updateProjectRecord: vi.fn(),
  deleteProjectRecord: vi.fn(),
}));

import { findProjectById } from "../repositories/project-repository";
import {
  getWorkspaceAccess,
  hasWorkspacePermission,
} from "@/src/modules/workspaces";

describe("project service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when the project does not exist", async () => {
    vi.mocked(findProjectById).mockResolvedValue(null);

    await expect(getProjectAccess("user-1", "project-1")).resolves.toBeNull();
  });

  it("returns null when the user is not a workspace member", async () => {
    vi.mocked(findProjectById).mockResolvedValue({
      id: "project-1",
      workspaceId: "workspace-1",
      name: "Project",
      description: null,
      status: "ACTIVE",
      createdBy: "owner-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getWorkspaceAccess).mockResolvedValue(null);

    await expect(getProjectAccess("user-1", "project-1")).resolves.toBeNull();
  });

  it("returns access for a permitted member", async () => {
    vi.mocked(findProjectById).mockResolvedValue({
      id: "project-1",
      workspaceId: "workspace-1",
      name: "Project",
      description: null,
      status: "ACTIVE",
      createdBy: "owner-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getWorkspaceAccess).mockResolvedValue({
      workspace: {
        id: "workspace-1",
        name: "Workspace",
        slug: "workspace",
        ownerId: "owner-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      membership: {
        id: "membership-1",
        workspaceId: "workspace-1",
        userId: "user-1",
        role: "MEMBER",
        joinedAt: new Date(),
      },
    });
    vi.mocked(hasWorkspacePermission).mockReturnValue(true);

    await expect(
      getProjectAccess("user-1", "project-1"),
    ).resolves.toMatchObject({
      project: { id: "project-1" },
      role: "MEMBER",
    });
  });
});
