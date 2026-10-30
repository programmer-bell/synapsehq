"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { setSessionCookie } from "../lib/cookies";
import { getClientIp } from "../lib/request";
import { loginSchema } from "../schemas/auth";
import { loginUser } from "../services/login-service";
import type { AuthFieldErrors, AuthFormState } from "../types";

function toFieldErrors(error: z.ZodError): AuthFieldErrors {
  const fieldErrors = z.flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >;

  return Object.fromEntries(
    Object.entries(fieldErrors).filter(
      ([, messages]) => messages && messages.length > 0,
    ),
  ) as AuthFieldErrors;
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const ip = await getClientIp();
  const result = await loginUser(parsed.data, { ip });

  if (!result.ok) {
    if (result.code === "RATE_LIMITED") {
      return {
        status: "error",
        message:
          "Too many failed attempts. Please wait a few minutes and try again.",
      };
    }

    if (result.code === "INVALID_CREDENTIALS") {
      return {
        status: "error",
        message: "Invalid email or password.",
      };
    }

    return {
      status: "error",
      message: "We could not sign you in. Please try again.",
    };
  }

  await setSessionCookie(result.token, result.expiresAt);
  redirect("/dashboard");
}
