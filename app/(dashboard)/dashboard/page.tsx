import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-accent">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Your authenticated workspace is ready. Workspaces, projects, and tasks
          arrive in the next phases.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8">
        <p className="text-sm font-medium text-foreground">
          No projects yet
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Project creation and workspace management are planned for Phase 3.
        </p>
      </div>
    </div>
  );
}
