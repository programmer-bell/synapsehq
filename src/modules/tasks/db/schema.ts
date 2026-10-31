import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "@/src/modules/auth/db/schema";
import { projects } from "@/src/modules/projects/db/schema";

export const taskStatus = pgEnum("task_status", [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
]);

export const taskPriority = pgEnum("task_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    status: taskStatus("status").notNull().default("TODO"),
    priority: taskPriority("priority").notNull().default("MEDIUM"),
    assigneeId: uuid("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("tasks_project_id_idx").on(table.projectId),
    index("tasks_assignee_id_idx").on(table.assigneeId),
    index("tasks_status_idx").on(table.status),
    index("tasks_priority_idx").on(table.priority),
    index("tasks_due_date_idx").on(table.dueDate),
  ],
);

export type TaskRecord = typeof tasks.$inferSelect;
export type NewTaskRecord = typeof tasks.$inferInsert;