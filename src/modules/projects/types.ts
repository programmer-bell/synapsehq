export type ProjectStatus = "ACTIVE" | "ARCHIVED";

export type Project = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectField = "name" | "description" | "status";

export type ProjectFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<ProjectField, string[]>>;
};

export type ProjectSummary = Project;
