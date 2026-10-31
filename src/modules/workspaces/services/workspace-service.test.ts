import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  findWorkspaceById,
  findWorkspaceMembership,
  updateWorkspaceRecord,
} from "../repositories/workspace-repository";
import { updateWorkspace } from "./workspace-service";

vi.mock("../repositories/workspace-repository", () => ({
  findWorkspaceById: vi.fn(),
  findWorkspaceMembership: vi.fn(),
  updateWorkspaceRecord: vi.fn(),
  findWorkspaceBySlug: vi.fn(),
  createWorkspaceMembership: vi.fn(),
  deleteWorkspaceMembership: vi.fn(),
  deleteWorkspaceRecord: vi.fn(),
  listWorkspaceMembers: vi.fn(),
  listWorkspacesForUser: vi.fn(),
}));

describe("workspace service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns NOT_FOUND when the workspace does not exist", async () => {
    vi.mocked(findWorkspaceById).mockResolvedValue(null);

    await expect(
      updateWorkspace("user-1", "workspace-1", { name: "New name" }),
    ).resolves.toEqual({
      ok: false,
      code: "NOT_FOUND",
    });
  });

  it("returns FORBIDDEN for members without update permission", async () => {
    vi.mocked(findWorkspaceById).mockResolvedValue({
      id: "workspace-1",
      name: "Workspace",
      slug: "workspace",
      ownerId: "owner-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(findWorkspaceMembership).mockResolvedValue({
      id: "membership-1",
      workspaceId: "workspace-1",
      userId: "member-1",
      role: "MEMBER",
      joinedAt: new Date(),
    });

    await expect(
      updateWorkspace("member-1", "workspace-1", { name: "New name" }),
    ).resolves.toEqual({
      ok: false,
      code: "FORBIDDEN",
    });
    expect(updateWorkspaceRecord).not.toHaveBeenCalled();
  });
});
