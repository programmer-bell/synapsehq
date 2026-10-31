import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";

import { users } from "@/src/modules/auth/db/schema";
import { tasks } from "@/src/modules/tasks/db/schema";
import { db } from "@/src/shared/db";
import { workspaceMembers } from "@/src/modules/workspaces/db/schema";

import { projectMembers, projectMilestones } from "../db/schema";

export async function listProjectTeam(projectId: string) {
  return db
    .select({
      id: projectMembers.id,
      userId: projectMembers.userId,
      name: users.name,
      email: users.email,
      allocationPercent: projectMembers.allocationPercent,
      createdAt: projectMembers.createdAt,
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, projectId))
    .orderBy(users.name);
}

export async function listProjectCandidates(workspaceId: string) {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .orderBy(users.name);
}

export async function createProjectMember(input: {
  projectId: string;
  userId: string;
  allocationPercent: number;
  addedBy: string;
}) {
  const [record] = await db.insert(projectMembers).values(input).returning();
  return record;
}

export async function removeProjectMember(
  projectId: string,
  userId: string,
): Promise<void> {
  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    );
}

export async function findProjectMember(projectId: string, userId: string) {
  const [record] = await db
    .select({ id: projectMembers.id })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    )
    .limit(1);
  return record ?? null;
}

export async function listMilestones(projectId: string) {
  const rows = await db
    .select({
      id: projectMilestones.id,
      projectId: projectMilestones.projectId,
      name: projectMilestones.name,
      description: projectMilestones.description,
      status: projectMilestones.status,
      dueDate: projectMilestones.dueDate,
      createdAt: projectMilestones.createdAt,
      taskCount: count(tasks.id),
      completedTaskCount: count(
        sql`case when ${tasks.status} = 'DONE' then ${tasks.id} end`,
      ),
    })
    .from(projectMilestones)
    .leftJoin(tasks, eq(tasks.milestoneId, projectMilestones.id))
    .where(eq(projectMilestones.projectId, projectId))
    .groupBy(projectMilestones.id)
    .orderBy(desc(projectMilestones.dueDate));
  return rows.map((row) => ({
    ...row,
    taskCount: Number(row.taskCount),
    completedTaskCount: Number(row.completedTaskCount),
  }));
}

export async function createMilestoneRecord(input: {
  projectId: string;
  name: string;
  description: string | null;
  dueDate: Date | null;
  createdBy: string;
}) {
  const [record] = await db.insert(projectMilestones).values(input).returning();
  return record;
}

export async function updateMilestoneStatusRecord(
  milestoneId: string,
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED",
) {
  const [record] = await db
    .update(projectMilestones)
    .set({ status, updatedAt: new Date() })
    .where(eq(projectMilestones.id, milestoneId))
    .returning();
  return record ?? null;
}

export async function findMilestone(milestoneId: string) {
  const [record] = await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.id, milestoneId))
    .limit(1);
  return record ?? null;
}

export async function countProjectTasks(projectId: string) {
  const [record] = await db
    .select({
      total: count(),
      completed: count(
        sql`case when ${tasks.status} = 'DONE' then ${tasks.id} end`,
      ),
    })
    .from(tasks)
    .where(
      and(eq(tasks.projectId, projectId), sql`${tasks.parentTaskId} is null`),
    );
  return {
    total: Number(record.total),
    completed: Number(record.completed),
  };
}
