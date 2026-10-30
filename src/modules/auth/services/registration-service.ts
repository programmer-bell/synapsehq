import "server-only";

import { isUniqueViolation } from "../lib/db-errors";
import { hashPassword } from "../lib/password";
import { toAuthUser } from "../lib/user";
import {
  createUser,
  findUserByEmail,
} from "../repositories/user-repository";
import type { SignupInput } from "../schemas/auth";
import type { RegistrationResult } from "../types";

export async function registerUser(
  input: SignupInput,
): Promise<RegistrationResult> {
  try {
    const existingUser = await findUserByEmail(input.email);

    if (existingUser) {
      return { ok: false, code: "EMAIL_TAKEN" };
    }

    const passwordHash = await hashPassword(input.password);
    const user = await createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return { ok: true, user: toAuthUser(user) };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, code: "EMAIL_TAKEN" };
    }

    return { ok: false, code: "UNKNOWN" };
  }
}
