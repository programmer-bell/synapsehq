import { Suspense } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Circle,
  FolderKanban,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/src/modules/auth";
import { getDashboardData } from "@/src/shared/lib/dashboard-data";
import { cn } from "@/src/shared/lib/cn";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const user = await requireUser();
  const { workspaces, projects: projectRecords } = await getDashboardData(
    user.id,
  );

  const workspaceMap = new Map(workspaces.map((w) => [w.id, w]));
  const projects = projectRecords.map((project) => ({
    ...project,
    workspace: workspaceMap.get(project.workspaceId)!,
  }));

  const steps = [
    {
      label: "Create a workspace",
      description: "Organize teams, projects, and access in one place.",
      done: workspaces.length > 0,
      href: "/workspaces",
    },
    {
      label: "Add your first project",
      description: "Group related work under a shared delivery goal.",
      done: projects.length > 0,
      href: workspaces[0] ? `/workspaces/${workspaces[0].id}` : "/workspaces",
    },
    {
      label: "Create a task",
      description: "Turn the plan into clear, assignable work.",
      done: false,
      href: projects[0]
        ? `/projects/${projects[0].id}/tasks`
        : workspaces[0]
          ? `/workspaces/${workspaces[0].id}`
          : "/workspaces",
    },
  ];
  const completedSteps = steps.filter((step) => step.done).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace overview"
        title={`Good to see you, ${user.name.split(" ")[0]}`}
        description="Your workspaces and projects, all in one calm, focused place."
        icon={<Sparkles aria-hidden="true" />}
        actions={
          <>
            <Link
              href="/workspaces"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:text-accent active:scale-[0.98]"
            >
              <Building2 aria-hidden="true" className="size-4" />
              View workspaces
            </Link>
            <Link
              href={
                projects[0]
                  ? `/projects/${projects[0].id}/tasks`
                  : "/workspaces"
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 active:scale-[0.98]"
            >
              <Rocket aria-hidden="true" className="size-4" />
              {projects.length ? "Open tasks" : "Get started"}
            </Link>
          </>
        }
      />

      <section
        aria-label="Workspace statistics"
        className="grid gap-3 md:grid-cols-3"
      >
        <StatCard
          label="Workspaces"
          value={workspaces.length}
          hint="Spaces you belong to"
          icon={<Building2 aria-hidden="true" />}
          gradient="from-indigo-500 to-violet-500"
        />
        <StatCard
          label="Projects"
          value={projects.length}
          hint="Active delivery streams"
          icon={<FolderKanban aria-hidden="true" />}
          gradient="from-sky-500 to-cyan-500"
        />
        <StatCard
          label="Your role"
          value={workspaces[0]?.role ?? "Member"}
          hint="Access across your workspace"
          icon={<ShieldCheck aria-hidden="true" />}
          gradient="from-emerald-500 to-teal-500"
          isText
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Workspaces
              </h2>
              <p className="text-xs text-muted-foreground">
                Jump back into the spaces your team uses.
              </p>
            </div>
            <Link
              href="/workspaces"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent/80"
            >
              View all
              <ArrowRight aria-hidden="true" className="size-3" />
            </Link>
          </div>
          {workspaces.length === 0 ? (
            <EmptyState
              icon={<Building2 aria-hidden="true" />}
              title="No workspaces yet"
              description="Create a workspace to start organizing projects and inviting teammates."
              action={
                <Link
                  href="/workspaces"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]"
                >
                  Create workspace
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {workspaces.map((workspace, index) => (
                <Link
                  key={workspace.id}
                  href={`/workspaces/${workspace.id}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                      index % 3 === 0
                        ? "from-indigo-500 to-violet-500"
                        : index % 3 === 1
                          ? "from-sky-500 to-cyan-500"
                          : "from-emerald-500 to-teal-500",
                    )}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/10 text-sm font-semibold text-accent">
                        {workspace.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                          {workspace.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {workspace.projectCount} projects ·{" "}
                          {workspace.memberCount} members
                        </p>
                      </div>
                    </div>
                    <Badge variant="violet">{workspace.role}</Badge>
                  </div>
                  <span className="mt-3 flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-accent">
                    Open workspace
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Quick start
              </h2>
              <p className="text-xs text-muted-foreground">
                {completedSteps} of {steps.length} steps complete
              </p>
            </div>
            <Badge
              variant={completedSteps === steps.length ? "success" : "outline"}
            >
              {Math.round((completedSteps / steps.length) * 100)}%
            </Badge>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-[width] duration-500"
              style={{
                width: `${Math.round((completedSteps / steps.length) * 100)}%`,
              }}
            />
          </div>
          <ol className="mt-4 space-y-2.5">
            {steps.map((step) => (
              <li key={step.label}>
                <Link
                  href={step.href}
                  className="group flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-surface-muted/60"
                >
                  {step.done ? (
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-emerald-500"
                    />
                  ) : (
                    <Circle
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground/40"
                    />
                  )}
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-xs font-medium text-foreground",
                        step.done && "line-through opacity-60",
                      )}
                    >
                      {step.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                      {step.description}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="ml-auto mt-0.5 size-3 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Recent projects
            </h2>
            <p className="text-xs text-muted-foreground">
              The work closest to your day-to-day.
            </p>
          </div>
        </div>
        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban aria-hidden="true" />}
            title="No projects yet"
            description="Create a project from a workspace to start tracking work and milestones."
            action={
              <Link
                href="/workspaces"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:text-accent active:scale-[0.98]"
              >
                Go to workspaces
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300">
                      <FolderKanban aria-hidden="true" className="size-4" />
                    </span>
                    <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                      {project.name}
                    </h3>
                  </div>
                  <Badge
                    variant={
                      project.status === "ACTIVE" ? "success" : "outline"
                    }
                    dot
                  >
                    {project.status}
                  </Badge>
                </div>
                <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Building2 aria-hidden="true" className="size-3" />
                  {project.workspace.name}
                </p>
                <span className="mt-3 flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-accent">
                  View project
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  gradient,
  isText = false,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: ReactNode;
  gradient: string;
  isText?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5">
      <span
        aria-hidden="true"
        className={cn(
          "absolute -right-6 -top-6 size-20 rounded-full bg-gradient-to-br opacity-10 blur-xl transition-opacity duration-200 group-hover:opacity-20",
          gradient,
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 font-semibold tracking-tight text-foreground",
              isText ? "text-lg capitalize" : "text-2xl tabular-nums",
            )}
          >
            {value}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm [&>svg]:size-4",
            gradient,
          )}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function DashboardPageFallback() {
  return (
    <div className="space-y-6" aria-label="Loading workspace overview">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-start gap-3">
          <div className="size-11 animate-pulse rounded-xl bg-surface-muted" />
          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-surface-muted" />
            <div className="h-7 w-48 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-surface-muted/70" />
          </div>
        </div>
        <div className="h-9 w-36 animate-pulse rounded-lg bg-surface-muted" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {["workspaces", "projects", "role"].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}
