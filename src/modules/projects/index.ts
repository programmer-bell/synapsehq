export {
  countProjectsForWorkspaces,
  createProject,
  deleteProject,
  getProjectAccess,
  listProjectsForWorkspace,
  listProjectsForWorkspaces,
  updateProject,
} from "./services/project-service";
export {
  addProjectTeamMember,
  createProjectMilestone,
  getProjectMilestones,
  getProjectTeam,
  isProjectMilestone,
  removeProjectTeamMember,
  updateProjectMilestoneStatus,
} from "./services/project-work-service";

export type {
  Project,
  ProjectFormState,
  ProjectStatus,
  ProjectSummary,
} from "./types";
