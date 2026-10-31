import "server-only";

import { cache } from "react";

import { listProjectsForWorkspaces } from "@/src/modules/projects";
import { listWorkspacesForUserWithSummary } from "@/src/modules/workspaces";

export const getDashboardData = cache(async (userId: string) => {
  const workspaces = await listWorkspacesForUserWithSummary(userId);
  const projects = await listProjectsForWorkspaces(
    workspaces.map((workspace) => workspace.id),
  );

  return { workspaces, projects };
});
