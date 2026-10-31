import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PageShell } from "@/src/shared/components/layout/page-shell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-1">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <PageShell>{children}</PageShell>
    </div>
  );
}
