import { describe, expect, it } from "vitest";

import {
  canDeleteProject,
  canManageProject,
  hasWorkspacePermission,
} from "./permissions";

describe("workspace permissions", () => {
  it("grants owners all permissions", () => {
    expect(hasWorkspacePermission("OWNER", "workspace:delete")).toBe(true);
    expect(hasWorkspacePermission("OWNER", "members:manage")).toBe(true);
  });

  it("grants admins member and project management but not workspace deletion", () => {
    expect(hasWorkspacePermission("ADMIN", "members:manage")).toBe(true);
    expect(hasWorkspacePermission("ADMIN", "workspace:delete")).toBe(false);
  });

  it("grants members read and project creation only", () => {
    expect(hasWorkspacePermission("MEMBER", "projects:create")).toBe(true);
    expect(hasWorkspacePermission("MEMBER", "projects:update")).toBe(false);
  });

  it("allows project creators to manage their own projects", () => {
    expect(canManageProject("MEMBER", "project-owner", "project-owner")).toBe(
      true,
    );
    expect(canManageProject("MEMBER", "other-user", "project-owner")).toBe(
      false,
    );
  });

  it("allows deletion by admins or creators", () => {
    expect(canDeleteProject("ADMIN", "other-user", "member")).toBe(true);
    expect(canDeleteProject("MEMBER", "creator", "creator")).toBe(true);
    expect(canDeleteProject("MEMBER", "creator", "other-member")).toBe(false);
  });
});
