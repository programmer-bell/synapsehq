import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { closeDb, db } from "@/src/shared/db";

import { authLoginAttempts, users } from "@/src/modules/auth/db/schema";
import {
  workspaceMembers,
  workspaces,
} from "@/src/modules/workspaces/db/schema";
import { projects } from "@/src/modules/projects/db/schema";
import { registerUser } from "@/src/modules/auth/services/registration-service";
import { createWorkspace } from "@/src/modules/workspaces/services/workspace-service";
import {
  createProject,
  deleteProject,
  getProjectAccess,
  listProjectsForWorkspace,
  updateProject,
} from "./project-service";

const describeIntegration = process.env.TEST_DATABASE_URL
  ? describe
  : describe.skip;

const ownerInput = {
  name: "Project Owner",
  email: "owner@example.com",
  password: "correct-password",
  confirmPassword: "correct-password",
};

const memberInput = {
  name: "Project Member",
  email: "member@example.com",
  password: "correct-password",
  confirmPassword: "correct-password",
};

const outsiderInput = {
  name: "Outsider",
  email: "outsider@example.com",
  password: "correct-password",
  confirmPassword: "correct-password",
};

describeIntegration("project database integration", () => {
  beforeEach(async () => {
    await db.delete(projects);
    await db.delete(workspaceMembers);
    await db.delete(workspaces);
    await db.delete(authLoginAttempts);
    await db.delete(users);
  });

  afterAll(async () => {
    await closeDb();
  });

  async function setupWorkspace() {
    const owner = await registerUser(ownerInput);
    if (!owner.ok) throw new Error("owner registration failed");

    const workspace = await createWorkspace(owner.user.id, {
      name: "Engineering",
    });
    if (!workspace.ok) throw new Error("workspace creation failed");

    return { owner, workspace };
  }

  it("creates, lists, updates, and deletes a project", async () => {
    const { owner, workspace } = await setupWorkspace();

    const created = await createProject(owner.user.id, {
      workspaceId: workspace.data.id,
      name: "API Gateway",
      description: "Core API",
      status: "ACTIVE",
    });

    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const listed = await listProjectsForWorkspace(
      owner.user.id,
      workspace.data.id,
    );
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.data).toHaveLength(1);
    }

    const access = await getProjectAccess(owner.user.id, created.data.id);
    expect(access?.project.name).toBe("API Gateway");

    const updated = await updateProject(owner.user.id, created.data.id, {
      name: "API Gateway v2",
      description: "Updated",
      status: "ARCHIVED",
    });
    expect(updated.ok).toBe(true);
    if (updated.ok) {
      expect(updated.data.status).toBe("ARCHIVED");
    }

    const deleted = await deleteProject(owner.user.id, created.data.id);
    expect(deleted.ok).toBe(true);
    expect(await getProjectAccess(owner.user.id, created.data.id)).toBeNull();
  });

  it("allows members to create projects", async () => {
    const { owner, workspace } = await setupWorkspace();
    const member = await registerUser(memberInput);
    if (!member.ok) throw new Error("member registration failed");

    await (
      await import("@/src/modules/workspaces/services/workspace-service")
    ).addWorkspaceMember(owner.user.id, workspace.data.id, {
      email: member.user.email,
      role: "MEMBER",
    });

    const created = await createProject(member.user.id, {
      workspaceId: workspace.data.id,
      name: "Member Project",
      description: null,
      status: "ACTIVE",
    });
    expect(created.ok).toBe(true);
  });

  it("rejects project access from outsiders", async () => {
    const { owner, workspace } = await setupWorkspace();
    const outsider = await registerUser(outsiderInput);
    if (!outsider.ok) throw new Error("outsider registration failed");

    const created = await createProject(owner.user.id, {
      workspaceId: workspace.data.id,
      name: "Private Project",
      description: null,
      status: "ACTIVE",
    });
    if (!created.ok) throw new Error("project creation failed");

    expect(
      await getProjectAccess(outsider.user.id, created.data.id),
    ).toBeNull();
    expect(
      await listProjectsForWorkspace(outsider.user.id, workspace.data.id),
    ).toMatchObject({ ok: false, code: "WORKSPACE_NOT_FOUND" });

    const update = await updateProject(outsider.user.id, created.data.id, {
      name: "Hijacked",
      description: null,
      status: "ACTIVE",
    });
    expect(update).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("enforces unique project names within a workspace", async () => {
    const { owner, workspace } = await setupWorkspace();

    const first = await createProject(owner.user.id, {
      workspaceId: workspace.data.id,
      name: "Duplicate",
      description: null,
      status: "ACTIVE",
    });
    expect(first.ok).toBe(true);

    const second = await createProject(owner.user.id, {
      workspaceId: workspace.data.id,
      name: "Duplicate",
      description: null,
      status: "ACTIVE",
    });
    expect(second.ok).toBe(false);
  });
});
