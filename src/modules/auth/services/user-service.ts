import "server-only";

import { findUserByEmail } from "../repositories/user-repository";
import { toAuthUser } from "../lib/user";
import type { AuthUser } from "../types";

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const user = await findUserByEmail(email);
  return user ? toAuthUser(user) : null;
}