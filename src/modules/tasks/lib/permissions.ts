import { hasWorkspacePermission } from "@/src/modules/workspaces";

export function canReadTasks(role: "OWNER" | "ADMIN" | "MEMBER"): boolean {
  return hasWorkspacePermission(role, "projects:read");
}

export function canCreateTasks(role: "OWNER" | "ADMIN" | "MEMBER"): boolean {
  return hasWorkspacePermission(role, "projects:read");
}

export function canUpdateTask(
  role: "OWNER" | "ADMIN" | "MEMBER",
  createdBy: string,
  assigneeId: string | null,
  userId: string,
): boolean {
  if (hasWorkspacePermission(role, "projects:update")) {
    return true;
  }

  return createdBy === userId || assigneeId === userId;
}

export function canDeleteTask(
  role: "OWNER" | "ADMIN" | "MEMBER",
  createdBy: string,
  userId: string,
): boolean {
  if (hasWorkspacePermission(role, "projects:delete")) {
    return true;
  }

  return createdBy === userId;
}
