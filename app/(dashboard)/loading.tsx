export default function DashboardLoading() {
  return (
    <div aria-label="Loading page content" className="space-y-6" role="status">
      <div className="space-y-2">
        <div className="h-3 w-28 animate-pulse rounded bg-surface-muted" />
        <div className="h-7 w-48 animate-pulse rounded bg-surface-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-surface-muted/70" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-md border border-border bg-surface"
          />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-md border border-border bg-surface" />
    </div>
  );
}
