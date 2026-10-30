import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { closeDb, db } from "@/src/shared/db";

import { authLoginAttempts, users } from "@/src/modules/auth/db/schema";
import { workspaceMembers, workspaces } from "@/src/modules/workspaces/db/schema";
import { projects } from "@/src/modules/projects/db/schema";
import { registerUser } from "@/src/modules/auth/services/registration-service";
import {
  addWorkspaceMember,
  createWorkspace,
  deleteWorkspace,
  getWorkspaceAccess,
  listWorkspaceMembersForUser,
  listWorkspacesForUserWithSummary,
  removeWorkspaceMember,
  updateWorkspace,
} from "./workspace-service";

const describeIntegration = process.env.TEST_DATABASE_URL ? describe : describe.skip;

const ownerInput = {
  name: "Workspace Owner",
  email: "owner@example.com",
  password: "correct-password",
  confirmPassword: "correct-password",
};

const memberInput = {
  name: "Workspace Member",
  email: "member@example.com",
  password: "correct-password",
  confirmPassword: "correct-password",
};

describeIntegration("workspace database integration", () => {
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

  it("creates a workspace with an owner membership", async () => {
    const owner = await registerUser(ownerInput);
    if (!owner.ok) throw new Error("owner registration failed");

    const result = await createWorkspace(owner.user.id, { name: "Engineering" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const workspaces = await listWorkspacesForUserWithSummary(owner.user.id);
    expect(workspaces).toHaveLength(1);
    expect(workspaces[0].role).toBe("OWNER");
    expect(workspaces[0].slug).toBe("engineering");
  });

  it("updates and deletes a workspace as owner", async () => {
    const owner = await registerUser(ownerInput);
    if (!owner.ok) throw new Error("owner registration failed");

    const created = await createWorkspace(owner.user.id, { name: "Engineering" });
    if (!created.ok) throw new Error("workspace creation failed");

    const updated = await updateWorkspace(owner.user.id, created.data.id, {
      name: "Platform",
    });
    expect(updated.ok).toBe(true);
    if (updated.ok) {
      expect(updated.data.name).toBe("Platform");
    }

    const deleted = await deleteWorkspace(owner.user.id, created.data.id);
    expect(deleted.ok).toBe(true);
    expect(await getWorkspaceAccess(owner.user.id, created.data.id)).toBeNull();
  });

  it("rejects workspace updates from non-owners", async () => {
    const owner = await registerUser(ownerInput);
    const member = await registerUser(memberInput);
    if (!owner.ok || !member.ok) throw new Error("registration failed");

    const created = await createWorkspace(owner.user.id, { name: "Engineering" });
    if (!created.ok) throw new Error("workspace creation failed");

    await addWorkspaceMember(owner.user.id, created.data.id, {
      email: member.user.email,
      role: "MEMBER",
    });

    const updated = await updateWorkspace(member.user.id, created.data.id, {
      name: "Hijacked",
    });

    expect(updated).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("adds and removes members by email", async () => {
    const owner = await registerUser(ownerInput);
    const member = await registerUser(memberInput);
    if (!owner.ok || !member.ok) throw new Error("registration failed");

    const created = await createWorkspace(owner.user.id, { name: "Engineering" });
    if (!created.ok) throw new Error("workspace creation failed");

    const added = await addWorkspaceMember(owner.user.id, created.data.id, {
      email: member.user.email,
      role: "MEMBER",
    });

    expect(added.ok).toBe(true);

    const members = await listWorkspaceMembersForUser(owner.user.id, created.data.id);
    expect(members.ok).toBe(true);
    if (members.ok) {
      expect(members.data).toHaveLength(2);
    }

    const removed = await removeWorkspaceMember(
      owner.user.id,
      created.data.id,
      member.user.id,
    );
    expect(removed.ok).toBe(true);
  });

  it("prevents cross-workspace access", async () => {
    const owner = await registerUser(ownerInput);
    const outsider = await registerUser(memberInput);
    if (!owner.ok || !outsider.ok) throw new Error("registration failed");

    const created = await createWorkspace(owner.user.id, { name: "Engineering" });
    if (!created.ok) throw new Error("workspace creation failed");

    expect(await getWorkspaceAccess(outsider.user.id, created.data.id)).toBeNull();
  });
});