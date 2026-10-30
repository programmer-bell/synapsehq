import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "@/src/modules/auth/db/schema";
import { workspaces } from "@/src/modules/workspaces/db/schema";

export const projectStatus = pgEnum("project_status", ["ACTIVE", "ARCHIVED"]);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    status: projectStatus("status").notNull().default("ACTIVE"),
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
    uniqueIndex("projects_workspace_name_unique").on(
      table.workspaceId,
      table.name,
    ),
    index("projects_workspace_id_idx").on(table.workspaceId),
    index("projects_created_by_idx").on(table.createdBy),
  ],
);

export type ProjectRecord = typeof projects.$inferSelect;
export type NewProjectRecord = typeof projects.$inferInsert;