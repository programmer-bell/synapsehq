export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkspaceMember = {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export type WorkspaceAccess = {
  workspace: Workspace;
  membership: WorkspaceMember;
};

export type WorkspaceField = "name" | "slug" | "email" | "role";

export type WorkspaceFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<WorkspaceField, string[]>>;
};

export type WorkspaceMemberActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export type WorkspaceSummary = Workspace & {
  role: WorkspaceRole;
  projectCount: number;
  memberCount: number;
};
