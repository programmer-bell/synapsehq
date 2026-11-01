import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PageShell } from "@/src/shared/components/layout/page-shell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-1 bg-background">
      <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-1 py-1 transition-opacity hover:opacity-80"
          aria-label="SynapseHQ home"
        >
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-lg object-cover ring-1 ring-border"
          />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            SynapseHQ
          </span>
        </Link>
      </div>
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <PageShell>{children}</PageShell>
    </div>
  );
}
