"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/src/modules/auth";
import { markNotificationAsRead } from "../services/notification-service";
import { z } from "zod";

export async function markNotificationReadAction(
  notificationId: string,
): Promise<void> {
  const user = await requireUser();
  if (!z.string().uuid().safeParse(notificationId).success) {
    throw new Error("Invalid notification.");
  }
  await markNotificationAsRead(user.id, notificationId);
  revalidatePath("/dashboard");
}
