"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { registerUser } from "../services/registration-service";
import { signupSchema } from "../schemas/auth";
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

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const result = await registerUser(parsed.data);

  if (!result.ok) {
    if (result.code === "EMAIL_TAKEN") {
      return {
        status: "error",
        message: "An account with this email already exists.",
        fieldErrors: {
          email: ["This email is already registered."],
        },
      };
    }

    return {
      status: "error",
      message: "We could not create your account. Please try again.",
    };
  }

  redirect("/login?registered=1");
}
