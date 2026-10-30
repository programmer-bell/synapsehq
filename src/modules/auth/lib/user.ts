import type { UserRecord } from "../db/schema";
import type { AuthUser } from "../types";

export function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
