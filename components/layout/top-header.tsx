"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { logoutAction } from "@/src/modules/auth/actions/logout";

type TopHeaderProps = {
  projects: { id: string; name: string }[];
};

const destinations = [
  { label: "Overview", href: "/dashboard" },
  { label: "Workspaces", href: "/workspaces" },
];

export function TopHeader({ projects }: TopHeaderProps) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => {
    const options = [
      ...destinations,
      ...projects.map((project) => ({
        label: project.name,
        href: `/projects/${project.id}/tasks`,
      })),
    ];
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? options.filter((option) =>
          option.label.toLowerCase().includes(normalizedQuery),
        )
      : options;
  }, [projects, query]);
  const taskHref = projects[0]
    ? `/projects/${projects[0].id}/tasks`
    : "/workspaces";

  const breadcrumb = pathname
    .split("/")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    );

  return (
    <>
      <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs text-muted-foreground sm:text-sm">
            {breadcrumb.join(" / ") || "Workspace"}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <svg
                aria-hidden="true"
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {mobileMenuOpen ? (
              <nav
                aria-label="Workspace navigation"
                className="absolute left-0 top-11 z-30 w-48 rounded-md border border-border bg-surface p-1.5 shadow-lg"
              >
                {destinations.map((destination) => (
                  <Link
                    key={destination.href}
                    href={destination.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-2.5 py-2 text-sm text-foreground hover:bg-surface-muted"
                  >
                    {destination.label}
                  </Link>
                ))}
                <Link
                  href={taskHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded px-2.5 py-2 text-sm text-foreground hover:bg-surface-muted"
                >
                  {projects.length ? "Project tasks" : "Workspaces"}
                </Link>
                <form
                  action={logoutAction}
                  className="border-t border-border pt-1.5"
                >
                  <button
                    type="submit"
                    className="w-full rounded px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  >
                    Sign out
                  </button>
                </form>
              </nav>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search (Control K)"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-surface-muted hover:text-foreground sm:w-56 sm:justify-between sm:border sm:border-border sm:px-3"
          >
            <span className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                className="size-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <span className="hidden text-left text-xs sm:inline">
                Search workspace
              </span>
            </span>
            <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
              Ctrl K
            </kbd>
          </button>
          <Link
            href={taskHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent/90 active:scale-[0.98] sm:text-sm"
          >
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            <span className="hidden sm:inline">
              {projects.length ? "New task" : "Create workspace"}
            </span>
            <span className="sm:hidden">
              {projects.length ? "New" : "Setup"}
            </span>
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              aria-expanded={notificationsOpen}
              aria-label="Notifications"
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-surface-muted hover:text-foreground"
            >
              <svg
                aria-hidden="true"
                className="size-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </button>
            {notificationsOpen ? (
              <div
                role="status"
                className="absolute right-0 top-11 z-30 w-64 rounded-md border border-border bg-surface p-4 shadow-lg"
              >
                <p className="text-sm font-medium text-foreground">
                  You&apos;re all caught up
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  New activity will appear here.
                </p>
              </div>
            ) : null}
          </div>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {paletteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 pt-[15vh]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPaletteOpen(false);
          }}
        >
          <section
            aria-label="Search workspace"
            aria-modal="true"
            role="dialog"
            className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-surface shadow-xl"
          >
            <label className="flex items-center gap-3 border-b border-border px-4">
              <svg
                aria-hidden="true"
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages and projects..."
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </label>
            <div className="p-2">
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Navigate
              </p>
              {results.length ? (
                results.map((result) => (
                  <Link
                    key={`${result.label}-${result.href}`}
                    href={result.href}
                    onClick={() => setPaletteOpen(false)}
                    className="block rounded-md px-2 py-2 text-sm text-foreground transition-colors duration-150 hover:bg-surface-muted"
                  >
                    {result.label}
                  </Link>
                ))
              ) : (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  No matching pages.
                </p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
