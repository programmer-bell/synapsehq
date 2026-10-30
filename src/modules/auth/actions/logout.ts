"use server";

import { redirect } from "next/navigation";

import { logoutCurrentSession } from "../services/session-service";

export async function logoutAction(): Promise<void> {
  await logoutCurrentSession();
  redirect("/login");
}
