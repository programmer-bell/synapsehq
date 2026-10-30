import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/src/modules/auth/components/auth-card";
import { SignupForm } from "@/src/modules/auth/components/signup-form";
import { getCurrentUser } from "@/src/modules/auth/services/session-service";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      title="Create your account"
      description="Start organizing projects and tasks in a secure workspace."
    >
      <SignupForm />
    </AuthCard>
  );
}
