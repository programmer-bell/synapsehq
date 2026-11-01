export default function DashboardLoading() {
  return (
    <div aria-label="Loading page content" className="space-y-6" role="status">
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
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  );
}
