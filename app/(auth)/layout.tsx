import type { ReactNode } from "react";

import { PageShell } from "@/src/shared/components/layout/page-shell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
