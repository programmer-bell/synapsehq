import { PageShell } from "@/src/shared/components/layout/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <p className="text-sm text-muted-foreground">Loading…</p>
    </PageShell>
  );
}
