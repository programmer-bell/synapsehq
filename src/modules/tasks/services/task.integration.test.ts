import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { closeDb, db } from "@/src/shared/db";

import { authLoginAttempts, users } from "@/src/modules/auth/db/schema";
import {
  workspaceMembers,
  workspaces,
} from "@/src/modules/workspaces/db/schema";
import { projects } from "@/src/modules/projects/db/schema";
import { tasks } from "@/src/modules/tasks/db/schema";
import { registerUser } from "@/src/modules/auth/services/registration-service";
import {
  countProjectsForWorkspaces,
  createProject,
  listProjectsForWorkspaces,
} from "@/src/modules/projects";
import {
  createWorkspace,
  getMemberCountsByWorkspaceIds,
} from "@/src/modules/workspaces";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/src/modules/notifications";
import {
  addTaskComment,
  createTaskSubtask,
  getTaskAttachmentForUser,
  getTaskDetails,
  removeTaskAttachment,
  uploadTaskAttachment,
} from "@/src/modules/tasks";
import {
  createTask,
  deleteTask,
  getTaskAccess,
  listTasksForProject,
  updateTask,
  updateTaskStatus,
} from "./task-service";

const describeIntegration = process.env.TEST_DATABASE_URL
  ? describe
  : describe.skip;

const ownerInput = {
  name: "Task Owner",
  email: "owner@example.com",
  password: "correct-password",
  confirmPassword: "correct-password",
};

const memberInput = {
  name: "Task Member",
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

describeIntegration("task database integration", () => {
  beforeEach(async () => {
    await db.delete(tasks);
    await db.delete(projects);
    await db.delete(workspaceMembers);
    await db.delete(workspaces);
    await db.delete(authLoginAttempts);
    await db.delete(users);
  });

  afterAll(async () => {
    await closeDb();
  });

  async function setup() {
    const owner = await registerUser(ownerInput);
    if (!owner.ok) throw new Error("owner registration failed");

    const workspace = await createWorkspace(owner.user.id, {
      name: "Engineering",
    });
    if (!workspace.ok) throw new Error("workspace creation failed");

    const project = await createProject(owner.user.id, {
      workspaceId: workspace.data.id,
      name: "API Gateway",
      description: null,
      status: "ACTIVE",
    });
    if (!project.ok) throw new Error("project creation failed");

    return { owner, workspace, project };
  }

  it("creates, lists, updates, and deletes a task", async () => {
    const { owner, project } = await setup();

    const created = await createTask(owner.user.id, {
      projectId: project.data.id,
      title: "Implement auth",
      description: "Add login",
      status: "TODO",
      priority: "HIGH",
      assigneeId: null,
      dueDate: null,
    });

    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const listed = await listTasksForProject(
      owner.user.id,
      project.data.id,
      {},
    );
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.data).toHaveLength(1);
    }

    const access = await getTaskAccess(owner.user.id, created.data.id);
    expect(access?.task.title).toBe("Implement auth");

    const status = await updateTaskStatus(
      owner.user.id,
      created.data.id,
      "IN_PROGRESS",
    );
    expect(status.ok).toBe(true);
    if (status.ok) {
      expect(status.data.status).toBe("IN_PROGRESS");
    }

    const updated = await updateTask(owner.user.id, created.data.id, {
      title: "Implement authentication",
      description: "Updated",
      status: "DONE",
      priority: "URGENT",
      assigneeId: null,
      dueDate: null,
    });
    expect(updated.ok).toBe(true);

    const deleted = await deleteTask(owner.user.id, created.data.id);
    expect(deleted.ok).toBe(true);
    expect(await getTaskAccess(owner.user.id, created.data.id)).toBeNull();
  });

  it("batches project and member summaries for workspaces", async () => {
    const { workspace, project } = await setup();
    const workspaceIds = [workspace.data.id];

    await expect(countProjectsForWorkspaces(workspaceIds)).resolves.toEqual({
      [workspace.data.id]: 1,
    });
    await expect(getMemberCountsByWorkspaceIds(workspaceIds)).resolves.toEqual({
      [workspace.data.id]: 1,
    });
    await expect(
      listProjectsForWorkspaces(workspaceIds),
    ).resolves.toMatchObject([
      { id: project.data.id, workspaceId: workspace.data.id },
    ]);
  });

  it("supports subtasks, comments, activity, and persisted attachments", async () => {
    const { owner, project } = await setup();
    const created = await createTask(owner.user.id, {
      projectId: project.data.id,
      title: "Parent task",
      description: "Track the release",
      status: "TODO",
      priority: "HIGH",
      assigneeId: null,
      dueDate: "",
    });
    if (!created.ok) throw new Error("task creation failed");

    expect(
      await createTaskSubtask(owner.user.id, created.data.id, "Write tests"),
    ).toMatchObject({ ok: true });
    const nested = await getTaskDetails(owner.user.id, created.data.id);
    const subtaskId = nested?.subtasks[0]?.id;
    expect(subtaskId).toBeDefined();
    if (!subtaskId) throw new Error("subtask was not created");
    expect(
      await createTaskSubtask(owner.user.id, subtaskId, "Nested task"),
    ).toMatchObject({ ok: false, code: "NESTED_SUBTASK" });

    expect(
      await addTaskComment(owner.user.id, created.data.id, "Ready for review"),
    ).toMatchObject({ ok: true });

    const file = new File(["release notes"], "release-notes.txt", {
      type: "text/plain",
    });
    expect(
      await uploadTaskAttachment(owner.user.id, created.data.id, file),
    ).toMatchObject({ ok: true });

    const details = await getTaskDetails(owner.user.id, created.data.id);
    expect(details?.comments).toMatchObject([
      { body: "Ready for review", authorName: "Task Owner" },
    ]);
    expect(details?.attachments).toMatchObject([
      { fileName: "release-notes.txt", sizeBytes: 13 },
    ]);
    expect(details?.activity.length).toBeGreaterThanOrEqual(4);
    const attachment = details?.attachments[0];
    if (!attachment) throw new Error("attachment was not listed");
    const storedAttachment = await getTaskAttachmentForUser(
      owner.user.id,
      created.data.id,
      attachment.id,
    );
    expect(storedAttachment).toMatchObject({ fileName: "release-notes.txt" });
    if (!storedAttachment) throw new Error("attachment was not accessible");
    expect(Buffer.from(storedAttachment.data).toString()).toBe("release notes");

    const outsider = await registerUser(outsiderInput);
    if (!outsider.ok) throw new Error("outsider registration failed");
    expect(await getTaskDetails(outsider.user.id, created.data.id)).toBeNull();
    expect(
      await getTaskAttachmentForUser(
        outsider.user.id,
        created.data.id,
        attachment.id,
      ),
    ).toBeNull();

    expect(
      await removeTaskAttachment(owner.user.id, created.data.id, attachment.id),
    ).toMatchObject({ ok: true });
  });

  it("assigns tasks only to workspace members", async () => {
    const { owner, project } = await setup();
    const member = await registerUser(memberInput);
    if (!member.ok) throw new Error("member registration failed");

    await (
      await import("@/src/modules/workspaces/services/workspace-service")
    ).addWorkspaceMember(owner.user.id, project.data.workspaceId, {
      email: member.user.email,
      role: "MEMBER",
    });

    const assigned = await createTask(owner.user.id, {
      projectId: project.data.id,
      title: "Assigned task",
      description: null,
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: member.user.id,
      dueDate: null,
    });
    expect(assigned.ok).toBe(true);
    const notificationRows = await getNotifications(member.user.id);
    expect(notificationRows).toMatchObject([
      { title: "Assigned a task", body: "Assigned task", readAt: null },
    ]);
    expect(await getNotifications(owner.user.id)).toEqual([]);
    const notification = notificationRows[0];

    const outsider = await registerUser(outsiderInput);
    if (!outsider.ok) throw new Error("outsider registration failed");
    expect(
      await markNotificationAsRead(outsider.user.id, notification.id),
    ).toBe(false);
    expect(await markNotificationAsRead(member.user.id, notification.id)).toBe(
      true,
    );

    const invalid = await createTask(owner.user.id, {
      projectId: project.data.id,
      title: "Invalid assignee",
      description: null,
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: outsider.user.id,
      dueDate: null,
    });
    expect(invalid).toMatchObject({ ok: false, code: "INVALID_ASSIGNEE" });
  });

  it("rejects task access from outsiders", async () => {
    const { owner, project } = await setup();
    const outsider = await registerUser(outsiderInput);
    if (!outsider.ok) throw new Error("outsider registration failed");

    const created = await createTask(owner.user.id, {
      projectId: project.data.id,
      title: "Private task",
      description: null,
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: null,
      dueDate: null,
    });
    if (!created.ok) throw new Error("task creation failed");

    expect(await getTaskAccess(outsider.user.id, created.data.id)).toBeNull();
    expect(
      await listTasksForProject(outsider.user.id, project.data.id, {}),
    ).toMatchObject({ ok: false, code: "PROJECT_NOT_FOUND" });

    const update = await updateTask(outsider.user.id, created.data.id, {
      title: "Hijacked",
      description: null,
      status: "DONE",
      priority: "LOW",
      assigneeId: null,
      dueDate: null,
    });
    expect(update).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("filters tasks by status and priority", async () => {
    const { owner, project } = await setup();

    await createTask(owner.user.id, {
      projectId: project.data.id,
      title: "Todo high",
      description: null,
      status: "TODO",
      priority: "HIGH",
      assigneeId: null,
      dueDate: null,
    });
    await createTask(owner.user.id, {
      projectId: project.data.id,
      title: "Done low",
      description: null,
      status: "DONE",
      priority: "LOW",
      assigneeId: null,
      dueDate: null,
    });

    const filtered = await listTasksForProject(owner.user.id, project.data.id, {
      status: "TODO",
      priority: "HIGH",
    });

    expect(filtered.ok).toBe(true);
    if (filtered.ok) {
      expect(filtered.data).toHaveLength(1);
      expect(filtered.data[0].title).toBe("Todo high");
    }
  });

  it("sorts tasks by title", async () => {
    const { owner, project } = await setup();

    await createTask(owner.user.id, {
      projectId: project.data.id,
      title: "Zeta",
      description: null,
      status: "TODO",
      priority: "LOW",
      assigneeId: null,
      dueDate: null,
    });
    await createTask(owner.user.id, {
      projectId: project.data.id,
      title: "Alpha",
      description: null,
      status: "TODO",
      priority: "LOW",
      assigneeId: null,
      dueDate: null,
    });

    const sorted = await listTasksForProject(owner.user.id, project.data.id, {
      sortBy: "title",
      sortDirection: "asc",
    });

    expect(sorted.ok).toBe(true);
    if (sorted.ok) {
      expect(sorted.data.map((task) => task.title)).toEqual(["Alpha", "Zeta"]);
    }
  });
});
