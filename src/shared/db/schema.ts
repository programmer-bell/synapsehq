import { pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export * from "@/src/modules/auth/db/schema";
export * from "@/src/modules/workspaces/db/schema";
export * from "@/src/modules/projects/db/schema";

/**
 * Infrastructure-only table used to verify the migration and query workflow.
 * Domain schemas belong to their respective modules under src/modules.
 */
export const systemHealth = pgTable("system_health", {
  id: serial("id").primaryKey(),
  checkedAt: timestamp("checked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
