"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  Flag,
  FolderKanban,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Plus,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { logoutAction } from "@/src/modules/auth/actions/logout";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/src/shared/lib/cn";

type AppSidebarProps = {
  name: string;
  email: string;
  workspaces: { id: string; name: string }[];
  projects: { id: string; name: string }[];
};

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/workspaces", label: "Workspaces", icon: Layers },
];

const projectDotColors = [
  "bg-indigo-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-fuchsia-500",
];

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildTaskHref(projectId: string | undefined, query: string) {
  if (!projectId) return "/workspaces";
  return `/projects/${projectId}/tasks?${query}`;
}

function sidebarLinkClass(active: boolean) {
  return cn(
    "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200",
    active
      ? "bg-gradient-to-r from-indigo-500/12 via-violet-500/10 to-transparent font-medium text-accent"
      : "text-muted-foreground hover:bg-surface-muted/80 hover:text-foreground",
  );
}

function SectionLabel({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: ReactNode;
}) {
  if (collapsed) return null;
  return (
    <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
      {children}
    </p>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  active = false,
  trailing,
  tooltip,
  collapsed,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  trailing?: ReactNode;
  tooltip?: string;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={href}
      suppressHydrationWarning
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={sidebarLinkClass(active)}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-gradient-to-b from-indigo-500 to-fuchsia-500"
        />
      ) : null}
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors duration-200 [&>svg]:size-4",
          active
            ? "bg-accent/12 text-accent"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        {icon}
      </span>
      {!collapsed ? (
        <span className="min-w-0 flex-1 truncate">{label}</span>
      ) : null}
      {!collapsed ? trailing : null}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip content={tooltip ?? label} side="right">
        {link}
      </Tooltip>
    );
  }
  return link;
}

export function AppSidebar({
  name,
  email,
  workspaces,
  projects,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const primaryProjectId = projects[0]?.id;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const quickFilters = [
    {
      label: "Inbox",
      icon: Inbox,
      href: buildTaskHref(primaryProjectId, "status=TODO"),
    },
    {
      label: "Today",
      icon: CalendarDays,
      href: buildTaskHref(
        primaryProjectId,
        `dueBefore=${isoDate(tomorrow)}&dueAfter=${isoDate(today)}`,
      ),
    },
    {
      label: "Upcoming",
      icon: CalendarClock,
      href: buildTaskHref(primaryProjectId, `dueAfter=${isoDate(tomorrow)}`),
    },
    {
      label: "High priority",
      icon: Flag,
      href: buildTaskHref(primaryProjectId, "priority=HIGH"),
    },
  ];

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-[76px]" : "w-[264px]",
      )}
    >
      <div
        className={cn(
          "flex h-[60px] shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-3" : "justify-between px-4",
        )}
      >
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="SynapseHQ home"
        >
          <span className="relative">
            <Image
              src="/logo.png"
              alt=""
              width={34}
              height={34}
              className="size-[34px] shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-border"
              priority
            />
            <span
              aria-hidden="true"
              className="absolute -inset-1 -z-10 rounded-xl bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/20 blur-md"
            />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
                SynapseHQ
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Engineering workspace
              </span>
            </span>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="rounded-md p-1.5 text-muted-foreground transition-all duration-200 hover:bg-surface-muted hover:text-foreground active:scale-95"
          >
            <ChevronsLeft aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {!collapsed ? (
          <Link
            href={
              primaryProjectId
                ? `/projects/${primaryProjectId}/tasks`
                : "/workspaces"
            }
            className="flex items-center justify-center gap-2 rounded-lg border border-indigo-500/25 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 active:scale-[0.98]"
          >
            <Plus aria-hidden="true" className="size-3.5" />
            New task
          </Link>
        ) : (
          <Tooltip content="New task" side="right">
            <Link
              href={
                primaryProjectId
                  ? `/projects/${primaryProjectId}/tasks`
                  : "/workspaces"
              }
              aria-label="New task"
              className="mx-auto flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-95"
            >
              <Plus aria-hidden="true" className="size-4" />
            </Link>
          </Tooltip>
        )}

        <div>
          <SectionLabel collapsed={collapsed}>Workspace</SectionLabel>
          <nav aria-label="Workspace navigation" className="space-y-0.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={<Icon aria-hidden="true" />}
                  active={
                    item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href)
                  }
                  collapsed={collapsed}
                />
              );
            })}
          </nav>
        </div>

        <div>
          <SectionLabel collapsed={collapsed}>Quick filters</SectionLabel>
          <nav aria-label="Quick filters" className="space-y-0.5">
            {quickFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <SidebarLink
                  key={filter.label}
                  href={filter.href}
                  label={filter.label}
                  icon={<Icon aria-hidden="true" />}
                  tooltip={
                    primaryProjectId
                      ? filter.label
                      : `${filter.label} (create a project first)`
                  }
                  collapsed={collapsed}
                />
              );
            })}
          </nav>
        </div>

        {workspaces.length ? (
          <div>
            <SectionLabel collapsed={collapsed}>Your workspaces</SectionLabel>
            <nav aria-label="Your workspaces" className="space-y-0.5">
              {workspaces.map((workspace) => {
                const href = `/workspaces/${workspace.id}`;
                return (
                  <SidebarLink
                    key={workspace.id}
                    href={href}
                    label={workspace.name}
                    icon={<Building2 aria-hidden="true" />}
                    active={pathname === href}
                    collapsed={collapsed}
                  />
                );
              })}
            </nav>
          </div>
        ) : null}

        {projects.length ? (
          <div>
            <SectionLabel collapsed={collapsed}>Projects</SectionLabel>
            <nav aria-label="Projects" className="space-y-0.5">
              {projects.map((project, index) => {
                const href = `/projects/${project.id}`;
                return (
                  <SidebarLink
                    key={project.id}
                    href={href}
                    label={project.name}
                    icon={<FolderKanban aria-hidden="true" />}
                    active={pathname.startsWith(href)}
                    collapsed={collapsed}
                    trailing={
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 shrink-0 rounded-full opacity-80",
                          projectDotColors[index % projectDotColors.length],
                        )}
                      />
                    }
                  />
                );
              })}
            </nav>
          </div>
        ) : null}
      </div>

      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "mb-2 flex items-center gap-2.5 rounded-lg border border-border/70 bg-surface-muted/40 px-2 py-2",
            collapsed ? "justify-center border-transparent bg-transparent" : "",
          )}
        >
          <Avatar name={name} size="sm" />
          {!collapsed ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-foreground">
                {name}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {email}
              </span>
            </span>
          ) : null}
          {!collapsed ? (
            <Sparkles
              aria-hidden="true"
              className="size-3.5 shrink-0 text-accent/70"
            />
          ) : null}
        </div>
        <div
          className={cn(
            "flex items-center",
            collapsed ? "flex-col gap-1" : "justify-between px-1",
          )}
        >
          {!collapsed ? (
            <span className="text-[11px] font-medium text-muted-foreground">
              Appearance
            </span>
          ) : null}
          <ThemeToggle />
        </div>
        <form action={logoutAction} className="mt-2">
          <button
            type="submit"
            aria-label="Sign out"
            className={cn(
              "flex w-full items-center gap-2 rounded-lg text-xs text-muted-foreground transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-600 active:scale-[0.98] dark:hover:text-rose-300",
              collapsed ? "justify-center px-0 py-2" : "px-2 py-1.5",
            )}
          >
            <LogOut aria-hidden="true" className="size-3.5 shrink-0" />
            {!collapsed ? "Sign out" : null}
          </button>
        </form>
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="mt-1 flex w-full justify-center rounded-md py-1.5 text-muted-foreground transition-all duration-200 hover:bg-surface-muted hover:text-foreground active:scale-95"
          >
            <ChevronsRight aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
    </aside>
  );
}
