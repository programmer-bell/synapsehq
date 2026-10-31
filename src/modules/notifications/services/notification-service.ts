import "server-only";

import { logServerError } from "@/src/shared/lib/log-server-error";

import {
  createNotification,
  listNotifications,
  markNotificationRead,
} from "../repositories/notification-repository";

export async function notifyUser(input: {
  userId: string;
  actorId?: string | null;
  title: string;
  body: string;
  href: string;
}): Promise<void> {
  try {
    await createNotification(input);
  } catch (error) {
    logServerError("notifyUser failed", error, { userId: input.userId });
  }
}

export async function getNotifications(userId: string) {
  try {
    return await listNotifications(userId);
  } catch (error) {
    logServerError("getNotifications failed", error, { userId });
    throw error;
  }
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  try {
    return await markNotificationRead(userId, notificationId);
  } catch (error) {
    logServerError("markNotificationAsRead failed", error, { userId });
    throw error;
  }
}
