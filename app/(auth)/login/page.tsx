import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/src/modules/auth/components/auth-card";
import { LoginForm } from "@/src/modules/auth/components/login-form";
import { getCurrentUser } from "@/src/modules/auth/services/session-service";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string;
  }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue to your engineering workspace."
    >
      <Suspense fallback={<LoginForm />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <>
      {params.registered === "1" ? (
        <p
          role="status"
          className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          Account created. Sign in with your new credentials.
        </p>
      ) : null}
      <LoginForm />
    </>
  );
}
