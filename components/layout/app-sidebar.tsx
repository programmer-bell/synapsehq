"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { logoutAction } from "@/src/modules/auth/actions/logout";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type AppSidebarProps = {
  name: string;
  email: string;
  workspaces: { id: string; name: string }[];
  projects: { id: string; name: string }[];
};

const navigation = [
  { href: "/dashboard", label: "Overview", icon: "grid" },
  { href: "/workspaces", label: "Workspaces", icon: "layers" },
];

function NavigationIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="size-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export function AppSidebar({
  name,
  email,
  workspaces,
  projects,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  function navClass(href: string) {
    const active =
      pathname === href ||
      (href !== "/dashboard" &&
        href !== "/workspaces" &&
        pathname.startsWith(href));
    return `flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 ${
      active
        ? "bg-accent/10 font-medium text-accent"
        : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
    }`;
  }

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-150 lg:flex ${
        collapsed ? "w-[76px]" : "w-60"
      }`}
    >
      <div
        className={`flex h-[60px] items-center border-b border-border ${
          collapsed ? "justify-center px-3" : "justify-between px-4"
        }`}
      >
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="SynapseHQ home"
        >
          <Image
            src="/logo.png"
            alt=""
            width={34}
            height={34}
            className="size-[34px] shrink-0 rounded-md object-cover"
            priority
          />
          {!collapsed ? (
            <span className="truncate text-sm font-semibold tracking-tight text-foreground">
              SynapseHQ
            </span>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-surface-muted hover:text-foreground"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M15 18 9 12l6-6" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {!collapsed ? (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Workspace
          </p>
        ) : null}
        <nav aria-label="Workspace navigation" className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={pathname === item.href ? "page" : undefined}
              className={navClass(item.href)}
            >
              <NavigationIcon name={item.icon} />
              {!collapsed ? item.label : null}
            </Link>
          ))}
        </nav>
        {!collapsed && workspaces.length ? (
          <div className="mt-6">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Your workspaces
            </p>
            <nav aria-label="Your workspaces" className="space-y-1">
              {workspaces.map((workspace) => {
                const href = `/workspaces/${workspace.id}`;
                return (
                  <Link
                    key={workspace.id}
                    href={href}
                    aria-current={pathname === href ? "page" : undefined}
                    className={navClass(href)}
                  >
                    <NavigationIcon name="layers" />
                    <span className="truncate">{workspace.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
        {!collapsed && projects.length ? (
          <div className="mt-6">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Projects
            </p>
            <nav aria-label="Projects" className="space-y-1">
              {projects.map((project) => {
                const href = `/projects/${project.id}`;
                return (
                  <Link
                    key={project.id}
                    href={href}
                    title={project.name}
                    aria-current={
                      pathname.startsWith(href) ? "page" : undefined
                    }
                    className={navClass(href)}
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                    <span className="truncate">{project.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border p-3">
        <div
          className={`mb-2 flex items-center gap-3 rounded-md px-2 py-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-xs font-semibold text-accent"
          >
            {name
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
          {!collapsed ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-foreground">
                {name}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {email}
              </span>
            </span>
          ) : null}
        </div>
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between px-2"}`}
        >
          {!collapsed ? (
            <span className="text-xs text-muted-foreground">Appearance</span>
          ) : null}
          <ThemeToggle />
        </div>
        {!collapsed ? (
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="w-full rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors duration-150 hover:bg-surface-muted hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="mt-2 flex w-full justify-center rounded-md py-1.5 text-muted-foreground transition-colors duration-150 hover:bg-surface-muted hover:text-foreground"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}
