"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { registerAction } from "../actions/register";
import type { AuthFormState } from "../types";
import { AuthField } from "./auth-field";

const initialState: AuthFormState = { status: "idle" };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300"
        >
          {state.message}
        </p>
      ) : null}

      <AuthField
        id="name"
        name="name"
        label="Name"
        type="text"
        autoComplete="name"
        placeholder="Ada Lovelace"
        error={state.fieldErrors?.name?.[0]}
      />
      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={state.fieldErrors?.email?.[0]}
      />
      <AuthField
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.password?.[0]}
      />
      <AuthField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword?.[0]}
      />

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        <UserPlus aria-hidden="true" className="size-4" />
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent transition-colors hover:text-accent/80 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
