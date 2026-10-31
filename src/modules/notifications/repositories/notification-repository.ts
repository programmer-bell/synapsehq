import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/src/shared/db";
import { users } from "@/src/modules/auth/db/schema";

import { notifications } from "../db/schema";

export async function listNotifications(userId: string) {
  return db
    .select({
      id: notifications.id,
      title: notifications.title,
      body: notifications.body,
      href: notifications.href,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
      actorName: users.name,
    })
    .from(notifications)
    .leftJoin(users, eq(notifications.actorId, users.id))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
}

export async function createNotification(input: {
  userId: string;
  actorId?: string | null;
  title: string;
  body: string;
  href: string;
}): Promise<void> {
  await db.insert(notifications).values(input);
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  const [record] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
        isNull(notifications.readAt),
      ),
    )
    .returning({ id: notifications.id });
  return Boolean(record);
}
