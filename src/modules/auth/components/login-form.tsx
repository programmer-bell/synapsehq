"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { loginAction } from "../actions/login";
import type { AuthFormState } from "../types";
import { AuthField } from "./auth-field";

const initialState: AuthFormState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
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
        autoComplete="current-password"
        error={state.fieldErrors?.password?.[0]}
      />

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        <LogIn aria-hidden="true" className="size-4" />
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Need an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-accent transition-colors hover:text-accent/80 hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
