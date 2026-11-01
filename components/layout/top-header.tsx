"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Columns3,
  Command,
  Flag,
  FolderKanban,
  Home,
  Inbox,
  Info,
  Layers,
  LayoutDashboard,
  ListTodo,
  Loader2,
  Menu,
  Plus,
  Search,
  Sparkles,
  Table2,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { logoutAction } from "@/src/modules/auth/actions/logout";
import { markNotificationReadAction } from "@/src/modules/notifications/actions/notification-actions";
import {
  searchWorkspaceTasksAction,
  type TaskSearchResult,
} from "@/src/modules/tasks/actions/task-actions";
import { cn } from "@/src/shared/lib/cn";

type TopHeaderProps = {
  userName: string;
  projects: { id: string; name: string }[];
  notifications: {
    id: string;
    title: string;
    body: string;
    href: string;
    readAt: Date | null;
    createdAt: Date;
    actorName: string | null;
  }[];
};

type PaletteOption = {
  label: string;
  href: string;
  category: string;
  icon: LucideIcon;
  keywords?: string;
};

const destinations = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workspaces", href: "/workspaces", icon: Layers },
];

const segmentLabels: Record<string, string> = {
  dashboard: "Overview",
  workspaces: "Workspaces",
  projects: "Projects",
  tasks: "Tasks",
  milestones: "Milestones",
  edit: "Edit",
  login: "Sign in",
  signup: "Sign up",
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function formatWhen(value: Date) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function notificationMeta(
  notification: TopHeaderProps["notifications"][number],
) {
  const text = `${notification.title} ${notification.body}`.toLowerCase();
  if (/(complete|done|success|merged|approved)/.test(text)) {
    return {
      variant: "success" as const,
      icon: CheckCircle2,
      label: "Success",
    };
  }
  if (/(due|overdue|deadline|reminder|soon)/.test(text)) {
    return {
      variant: "warning" as const,
      icon: TriangleAlert,
      label: "Warning",
    };
  }
  if (/(failed|error|delete|removed|risk|blocked)/.test(text)) {
    return {
      variant: "danger" as const,
      icon: AlertCircle,
      label: "Alert",
    };
  }
  return { variant: "info" as const, icon: Info, label: "Info" };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isMentionNotification(
  notification: TopHeaderProps["notifications"][number],
  userName: string,
) {
  const text = `${notification.title} ${notification.body}`;
  if (/\bmentions?\b/i.test(text)) return true;
  const firstName = userName.split(/\s+/)[0] ?? userName;
  const handle = userName.replace(/\s+/g, "");
  return [handle, firstName]
    .filter(Boolean)
    .some((name) => new RegExp(`@${escapeRegExp(name)}\\b`, "i").test(text));
}

function buildBreadcrumb(
  pathname: string,
  projects: { id: string; name: string }[],
) {
  const segments = pathname.split("/").filter(Boolean);
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const crumbs: { label: string; href: string; current: boolean }[] = [];
  let href = "";

  segments.forEach((segment, index) => {
    href += `/${segment}`;
    const project = projectMap.get(segment);
    let label = project?.name ?? segmentLabels[segment];

    if (!label && isUuid(segment)) {
      const next = segments[index + 1];
      label = next === "edit" ? "Edit task" : "Details";
    }

    if (!label) {
      label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    crumbs.push({
      label,
      href,
      current: index === segments.length - 1,
    });
  });

  return crumbs;
}

export function TopHeader({
  userName,
  projects,
  notifications,
}: TopHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSearching, startSearchTransition] = useTransition();
  const [taskResults, setTaskResults] = useState<TaskSearchResult[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread" | "mentions">("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQuery = useRef("");

  const primaryProjectId = projects[0]?.id;
  const taskHref = primaryProjectId
    ? `/projects/${primaryProjectId}/tasks`
    : "/workspaces";
  const visibleNotifications = useMemo(
    () => notifications.filter((item) => !dismissed.has(item.id)),
    [notifications, dismissed],
  );
  const unreadCount = visibleNotifications.filter(
    (notification) => !notification.readAt,
  ).length;

  const filteredNotifications = visibleNotifications.filter((notification) => {
    if (filter === "unread") return !notification.readAt;
    if (filter === "mentions")
      return isMentionNotification(notification, userName);
    return true;
  });

  const paletteOptions = useMemo<PaletteOption[]>(() => {
    const currentProjectId = pathname.match(/^\/projects\/([^/]+)/)?.[1];
    const viewOptions: PaletteOption[] = currentProjectId
      ? [
          {
            label: "Kanban view",
            href: `/projects/${currentProjectId}/tasks?view=kanban`,
            category: "Views",
            icon: Columns3,
            keywords: "board columns",
          },
          {
            label: "Table view",
            href: `/projects/${currentProjectId}/tasks?view=table`,
            category: "Views",
            icon: Table2,
            keywords: "list rows",
          },
        ]
      : [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const quickFilters: PaletteOption[] = primaryProjectId
      ? [
          {
            label: "Inbox",
            href: `/projects/${primaryProjectId}/tasks?status=TODO`,
            category: "Quick views",
            icon: Inbox,
            keywords: "todo open",
          },
          {
            label: "Today",
            href: `/projects/${primaryProjectId}/tasks?dueBefore=${isoDate(tomorrow)}&dueAfter=${isoDate(today)}`,
            category: "Quick views",
            icon: CalendarDays,
            keywords: "due now",
          },
          {
            label: "Upcoming",
            href: `/projects/${primaryProjectId}/tasks?dueAfter=${isoDate(tomorrow)}`,
            category: "Quick views",
            icon: CalendarClock,
            keywords: "later schedule",
          },
          {
            label: "High priority",
            href: `/projects/${primaryProjectId}/tasks?priority=HIGH`,
            category: "Quick views",
            icon: Flag,
            keywords: "urgent important",
          },
        ]
      : [];

    const quickActions: PaletteOption[] = [
      {
        label: "Create task",
        href: primaryProjectId
          ? `/projects/${primaryProjectId}/tasks?new=1`
          : "/workspaces",
        category: "Actions",
        icon: Plus,
        keywords: "add new task todo",
      },
      {
        label: "Create project",
        href: "/workspaces",
        category: "Actions",
        icon: FolderKanban,
        keywords: "add new project",
      },
      {
        label: "Create workspace",
        href: "/workspaces#create-workspace",
        category: "Actions",
        icon: Layers,
        keywords: "add new workspace team",
      },
    ];

    return [
      ...destinations.map((destination) => ({
        ...destination,
        category: "Navigate",
      })),
      ...quickActions,
      ...viewOptions,
      ...quickFilters,
      ...projects.map((project) => ({
        label: project.name,
        href: `/projects/${project.id}/tasks`,
        category: "Projects",
        icon: FolderKanban,
        keywords: "project tasks",
      })),
    ];
  }, [pathname, primaryProjectId, projects]);

  const taskOptions = useMemo<PaletteOption[]>(
    () =>
      taskResults.map((task) => ({
        label: task.title,
        href: `/projects/${task.projectId}/tasks/${task.id}`,
        category: "Tasks",
        icon: ListTodo,
        keywords: `${task.projectName} ${task.status} ${task.priority}`,
      })),
    [taskResults],
  );

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return paletteOptions;
    return [...taskOptions, ...paletteOptions].filter((option) =>
      `${option.label} ${option.category} ${option.keywords ?? ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [paletteOptions, query, taskOptions]);

  const groupedResults = useMemo(() => {
    const groups = new Map<string, PaletteOption[]>();
    results.forEach((option) => {
      groups.set(option.category, [
        ...(groups.get(option.category) ?? []),
        option,
      ]);
    });
    return [...groups.entries()];
  }, [results]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        setQuery("");
        setTaskResults([]);
        setActiveIndex(0);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setNotificationsOpen(false);
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function navigate(href: string) {
    setPaletteOpen(false);
    setNotificationsOpen(false);
    setMobileMenuOpen(false);
    router.push(href);
  }

  function updateQuery(value: string) {
    setQuery(value);
    setActiveIndex(0);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const normalized = value.trim();
    latestQuery.current = normalized;
    if (normalized.length < 2) {
      setTaskResults([]);
      return;
    }
    searchTimer.current = setTimeout(() => {
      startSearchTransition(async () => {
        try {
          const nextResults = await searchWorkspaceTasksAction(normalized);
          if (latestQuery.current !== normalized) return;
          setTaskResults(nextResults);
          setActiveIndex(0);
        } catch {
          if (latestQuery.current === normalized) setTaskResults([]);
        }
      });
    }, 250);
  }

  function onPaletteKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      navigate(results[activeIndex].href);
    }
  }

  function markOneRead(notificationId: string) {
    startTransition(async () => {
      await markNotificationReadAction(notificationId);
      router.refresh();
      toast({
        title: "Notification marked as read",
        variant: "success",
        duration: 2600,
      });
    });
  }

  function markAllRead() {
    const unread = visibleNotifications.filter((item) => !item.readAt);
    if (!unread.length) {
      toast({ title: "Everything is already read", variant: "info" });
      return;
    }
    startTransition(async () => {
      await Promise.all(
        unread.map((notification) =>
          markNotificationReadAction(notification.id),
        ),
      );
      router.refresh();
      toast({
        title: "All caught up",
        description: `${unread.length} notification${unread.length === 1 ? "" : "s"} marked as read.`,
        variant: "success",
      });
    });
  }

  function clearNotifications() {
    setDismissed(new Set(visibleNotifications.map((item) => item.id)));
    toast({
      title: "Notifications cleared",
      description: "Your inbox is clear for this session.",
      variant: "info",
    });
  }

  const breadcrumb = buildBreadcrumb(pathname, projects);
  const activeOption = results[activeIndex];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-3 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-surface-muted hover:text-foreground active:scale-95"
            >
              {mobileMenuOpen ? (
                <X aria-hidden="true" className="size-5" />
              ) : (
                <Menu aria-hidden="true" className="size-5" />
              )}
            </button>
            {mobileMenuOpen ? (
              <nav
                aria-label="Workspace navigation"
                className="absolute left-0 top-11 z-40 w-56 animate-scale-in rounded-xl border border-border bg-popover p-1.5 shadow-2xl"
              >
                {destinations.map((destination) => {
                  const Icon = destination.icon;
                  return (
                    <Link
                      key={destination.href}
                      href={destination.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                      {destination.label}
                    </Link>
                  );
                })}
                <Link
                  href={taskHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                >
                  <FolderKanban aria-hidden="true" className="size-4" />
                  {projects.length ? "Project tasks" : "Workspaces"}
                </Link>
                <form
                  action={logoutAction}
                  className="mt-1 border-t border-border pt-1.5"
                >
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300"
                  >
                    <ArrowRight aria-hidden="true" className="size-4" />
                    Sign out
                  </button>
                </form>
              </nav>
            ) : null}
          </div>

          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 items-center gap-1 sm:flex"
          >
            <Link
              href="/dashboard"
              aria-label="Overview"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <Home aria-hidden="true" className="size-3.5" />
            </Link>
            {breadcrumb.map((crumb) => (
              <span
                key={crumb.href}
                className="flex min-w-0 items-center gap-1"
              >
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground/60"
                />
                {crumb.current ? (
                  <span className="truncate text-xs font-semibold text-foreground">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="truncate rounded-md px-1 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
          <span className="truncate text-xs font-semibold text-foreground sm:hidden">
            {breadcrumb[breadcrumb.length - 1]?.label ?? "Workspace"}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTaskResults([]);
              setActiveIndex(0);
              setPaletteOpen(true);
            }}
            aria-label="Open command palette (Control K)"
            className="group flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-surface-muted hover:text-foreground active:scale-95 sm:h-9 sm:w-56 sm:justify-between sm:border sm:border-border sm:bg-card sm:px-3 sm:shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Search
                aria-hidden="true"
                className="size-4 shrink-0 transition-colors group-hover:text-accent"
              />
              <span className="hidden text-left text-xs text-muted-foreground sm:inline">
                Search workspace
              </span>
            </span>
            <kbd className="hidden items-center gap-0.5 rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
              <Command aria-hidden="true" className="size-2.5" />K
            </kbd>
          </button>

          <Link
            href={taskHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 hover:shadow-indigo-500/30 active:scale-[0.98] sm:text-sm"
          >
            <Plus aria-hidden="true" className="size-3.5" />
            <span className="hidden sm:inline">
              {projects.length ? "New task" : "Create workspace"}
            </span>
            <span className="sm:hidden">
              {projects.length ? "New" : "Setup"}
            </span>
          </Link>

          <div className="relative">
            <Tooltip content="Notifications" side="bottom">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-expanded={notificationsOpen}
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-surface-muted hover:text-foreground active:scale-95",
                  notificationsOpen && "bg-surface-muted text-foreground",
                )}
              >
                <Bell aria-hidden="true" className="size-[18px]" />
                {unreadCount ? (
                  <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>
            </Tooltip>

            {notificationsOpen ? (
              <div className="absolute right-0 top-11 z-40 w-[min(92vw,380px)] origin-top-right animate-scale-in overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
                <div className="flex items-start justify-between gap-3 border-b border-border px-3.5 py-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      Notifications
                      {unreadCount ? (
                        <Badge variant="danger" dot>
                          {unreadCount} new
                        </Badge>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Updates from your workspace
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
                  {(
                    [
                      { key: "all", label: "All" },
                      { key: "unread", label: "Unread" },
                      { key: "mentions", label: "Mentions" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFilter(tab.key)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
                        filter === tab.key
                          ? "bg-accent/12 text-accent"
                          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <span className="ml-auto flex items-center gap-1">
                    <Tooltip content="Mark all as read" side="bottom">
                      <button
                        type="button"
                        onClick={markAllRead}
                        disabled={isPending}
                        aria-label="Mark all notifications as read"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 disabled:opacity-50 dark:hover:text-emerald-300"
                      >
                        <CheckCheck aria-hidden="true" className="size-3.5" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Clear notifications" side="bottom">
                      <button
                        type="button"
                        onClick={clearNotifications}
                        aria-label="Clear notifications"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300"
                      >
                        <Trash2 aria-hidden="true" className="size-3.5" />
                      </button>
                    </Tooltip>
                  </span>
                </div>

                {filteredNotifications.length ? (
                  <ul className="max-h-[360px] divide-y divide-border overflow-y-auto">
                    {filteredNotifications.map((notification) => {
                      const meta = notificationMeta(notification);
                      const Icon = meta.icon;
                      return (
                        <li
                          key={notification.id}
                          className={cn(
                            "group relative px-3.5 py-3 transition-colors hover:bg-surface-muted/60",
                            !notification.readAt && "bg-accent/[0.035]",
                          )}
                        >
                          <Link
                            href={notification.href}
                            onClick={() => setNotificationsOpen(false)}
                            className="flex items-start gap-2.5 pr-6"
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                                meta.variant === "success" &&
                                  "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
                                meta.variant === "warning" &&
                                  "bg-amber-500/12 text-amber-600 dark:text-amber-300",
                                meta.variant === "danger" &&
                                  "bg-rose-500/12 text-rose-600 dark:text-rose-300",
                                meta.variant === "info" &&
                                  "bg-sky-500/12 text-sky-600 dark:text-sky-300",
                              )}
                            >
                              <Icon aria-hidden="true" className="size-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-semibold text-foreground">
                                  {notification.title}
                                </span>
                                <Badge variant={meta.variant} dot>
                                  {meta.label}
                                </Badge>
                              </span>
                              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                                {notification.body}
                              </span>
                              <span className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                {notification.actorName ? (
                                  <>
                                    <span>{notification.actorName}</span>
                                    <span aria-hidden="true">·</span>
                                  </>
                                ) : null}
                                <span suppressHydrationWarning>
                                  {formatWhen(notification.createdAt)}
                                </span>
                              </span>
                            </span>
                          </Link>
                          {!notification.readAt ? (
                            <Tooltip content="Mark as read" side="left">
                              <button
                                type="button"
                                onClick={() => markOneRead(notification.id)}
                                disabled={isPending}
                                aria-label="Mark notification as read"
                                className="absolute right-2.5 top-3 rounded-md p-1 text-muted-foreground opacity-0 transition-all duration-200 hover:bg-emerald-500/10 hover:text-emerald-600 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50 dark:hover:text-emerald-300"
                              >
                                <Check
                                  aria-hidden="true"
                                  className="size-3.5"
                                />
                              </button>
                            </Tooltip>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center px-6 py-10 text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                      <CheckCheck aria-hidden="true" className="size-5" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {filter === "mentions"
                        ? "No mentions yet"
                        : filter === "unread"
                          ? "No unread notifications"
                          : "You're all caught up"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {filter === "mentions"
                        ? "When someone @mentions you, it will appear here."
                        : "New updates will appear here."}
                    </p>
                  </div>
                )}

                <div className="border-t border-border bg-surface-muted/40 px-3.5 py-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex items-center justify-center gap-1 text-[11px] font-medium text-accent transition-colors hover:text-accent/80"
                  >
                    View workspace activity
                    <ArrowRight aria-hidden="true" className="size-3" />
                  </Link>
                </div>
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
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 px-4 pt-[12vh] backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPaletteOpen(false);
          }}
        >
          <section
            aria-label="Command palette"
            aria-modal="true"
            role="dialog"
            className="w-full max-w-xl animate-scale-in overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search
                aria-hidden="true"
                className="size-4 shrink-0 text-accent"
              />
              <input
                autoFocus
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                onKeyDown={onPaletteKeyDown}
                placeholder="Search pages, projects, and views..."
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>
            <div className="max-h-[52vh] overflow-y-auto p-2">
              {groupedResults.length ? (
                groupedResults.map(([category, options]) => (
                  <div key={category} className="mb-1">
                    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {category}
                    </p>
                    {options.map((option) => {
                      const Icon = option.icon;
                      const optionIndex = results.indexOf(option);
                      return (
                        <button
                          key={`${option.category}-${option.href}`}
                          type="button"
                          onMouseEnter={() => setActiveIndex(optionIndex)}
                          onClick={() => navigate(option.href)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                            optionIndex === activeIndex
                              ? "bg-accent/10 text-accent"
                              : "text-foreground hover:bg-surface-muted",
                          )}
                        >
                          <span className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                            <Icon aria-hidden="true" className="size-3.5" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {option.label}
                          </span>
                          <ArrowRight
                            aria-hidden="true"
                            className="size-3.5 shrink-0 opacity-40"
                          />
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center px-4 py-10 text-center">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Search aria-hidden="true" className="size-5" />
                  </span>
                  {isSearching ? (
                    <>
                      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                        <Loader2
                          aria-hidden="true"
                          className="size-4 animate-spin text-accent"
                        />
                        Searching tasks...
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Looking across your projects.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-3 text-sm font-medium text-foreground">
                        No results for “{query}”
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Try a task, project name, page, or quick view.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border bg-surface-muted/40 px-3 py-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-card px-1">
                    ↑
                  </kbd>
                  <kbd className="rounded border border-border bg-card px-1">
                    ↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-card px-1">
                    ↵
                  </kbd>
                  open
                </span>
              </span>
              {activeOption ? (
                <span className="flex items-center gap-1 text-accent">
                  <Sparkles aria-hidden="true" className="size-3" />
                  {activeOption.category}
                </span>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
