import type { WorkspaceRole } from "../types";

export type WorkspacePermission =
  | "workspace:read"
  | "workspace:update"
  | "workspace:delete"
  | "members:read"
  | "members:manage"
  | "projects:read"
  | "projects:create"
  | "projects:update"
  | "projects:delete";

const rolePermissions: Record<WorkspaceRole, WorkspacePermission[]> = {
  OWNER: [
    "workspace:read",
    "workspace:update",
    "workspace:delete",
    "members:read",
    "members:manage",
    "projects:read",
    "projects:create",
    "projects:update",
    "projects:delete",
  ],
  ADMIN: [
    "workspace:read",
    "workspace:update",
    "members:read",
    "members:manage",
    "projects:read",
    "projects:create",
    "projects:update",
    "projects:delete",
  ],
  MEMBER: [
    "workspace:read",
    "members:read",
    "projects:read",
    "projects:create",
  ],
};

export function hasWorkspacePermission(
  role: WorkspaceRole,
  permission: WorkspacePermission,
): boolean {
  return rolePermissions[role].includes(permission);
}

export function canManageProject(
  role: WorkspaceRole,
  projectCreatedBy: string,
  userId: string,
): boolean {
  if (hasWorkspacePermission(role, "projects:update")) {
    return true;
  }

  return projectCreatedBy === userId;
}

export function canDeleteProject(
  role: WorkspaceRole,
  projectCreatedBy: string,
  userId: string,
): boolean {
  if (hasWorkspacePermission(role, "projects:delete")) {
    return true;
  }

  return projectCreatedBy === userId;
}
