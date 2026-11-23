import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

export function AdminStatsShimmer() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      data-testid="admin-stats-shimmer"
    >
      {[1, 2, 3].map((i) => (
        <Card className="shimmer-stat-box py-4" key={i}>
          <CardContent className="flex items-center gap-4 px-5">
            <Skeleton className="admin-shimmer size-11 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="admin-shimmer h-3 w-3/5" />
              <Skeleton className="admin-shimmer h-6 w-2/5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminProjectsShimmer({ count = 6 }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      data-testid="admin-projects-shimmer"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card
          className="shimmer-project-card overflow-hidden py-0 gap-0"
          key={i}
        >
          <Skeleton className="admin-shimmer aspect-[16/10] w-full rounded-none" />
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="admin-shimmer h-4 w-24" />
              <Skeleton className="admin-shimmer h-4 w-12" />
            </div>
            <Skeleton className="admin-shimmer h-5 w-3/4" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="admin-shimmer h-3 w-full" />
              <Skeleton className="admin-shimmer h-3 w-5/6" />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <Skeleton className="admin-shimmer h-5 w-14 rounded-full" />
              <Skeleton className="admin-shimmer h-5 w-16 rounded-full" />
              <Skeleton className="admin-shimmer h-5 w-12 rounded-full" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-1.5">
                <Skeleton className="admin-shimmer size-8 rounded-md" />
                <Skeleton className="admin-shimmer size-8 rounded-md" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="admin-shimmer h-8 w-16 rounded-md" />
                <Skeleton className="admin-shimmer size-8 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminSkillsShimmer() {
  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      data-testid="admin-skills-shimmer"
    >
      {[1, 2].map((col) => (
        <Card key={col} className="gap-4 py-5">
          <CardHeader className="px-5 pb-0">
            <Skeleton className="admin-shimmer h-5 w-44" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 px-5">
            {[1, 2, 3, 4].map((row) => (
              <div
                className="skill-item-row flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                key={row}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Skeleton className="admin-shimmer size-9 shrink-0 rounded-md" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="admin-shimmer h-4 w-3/5" />
                    <Skeleton className="admin-shimmer h-3 w-1/3" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="admin-shimmer h-7 w-20 rounded-full" />
                  <Skeleton className="admin-shimmer size-8 rounded-md" />
                  <Skeleton className="admin-shimmer size-8 rounded-md" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminFormShimmer({ fields = 4 }) {
  return (
    <div
      data-testid="admin-form-shimmer"
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-group flex flex-col gap-2">
          <Skeleton className="admin-shimmer h-3.5 w-28" />
          <Skeleton className="admin-shimmer h-10 w-full rounded-md" />
        </div>
        <div className="form-group flex flex-col gap-2">
          <Skeleton className="admin-shimmer h-3.5 w-28" />
          <Skeleton className="admin-shimmer h-10 w-full rounded-md" />
        </div>
      </div>
      <div className="form-group flex flex-col gap-2">
        <Skeleton className="admin-shimmer h-3.5 w-24" />
        <Skeleton className="admin-shimmer h-20 w-full rounded-md" />
      </div>
      {fields > 3 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-group flex flex-col gap-2">
            <Skeleton className="admin-shimmer h-3.5 w-32" />
            <Skeleton className="admin-shimmer h-10 w-full rounded-md" />
          </div>
          <div className="form-group flex flex-col gap-2">
            <Skeleton className="admin-shimmer h-3.5 w-32" />
            <Skeleton className="admin-shimmer h-10 w-full rounded-md" />
          </div>
        </div>
      )}
      <Skeleton className="admin-shimmer h-10 w-40 rounded-md" />
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div
      className="flex min-h-dvh w-full bg-background text-foreground"
      data-testid="admin-dashboard-skeleton"
    >
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card p-4 lg:flex">
        <div className="flex items-center gap-2.5 px-2 pb-5">
          <Skeleton className="admin-shimmer size-7 rounded-md" />
          <Skeleton className="admin-shimmer h-5 w-24" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="admin-shimmer h-9 w-full rounded-md" />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="admin-shimmer h-3 w-16" />
            <Skeleton className="admin-shimmer h-4 w-28" />
          </div>
          <Skeleton className="admin-shimmer size-9 rounded-md" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <Skeleton className="admin-shimmer h-5 w-44" />
          <div className="flex items-center gap-2">
            <Skeleton className="admin-shimmer h-8 w-28 rounded-md" />
            <Skeleton className="admin-shimmer size-9 rounded-md" />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span className="size-2.5 animate-pulse rounded-full bg-foreground" />
            <span>Verifying Admin Session &amp; synchronizing Firestore...</span>
          </div>

          <AdminStatsShimmer />

          <Card className="gap-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="admin-shimmer h-5 w-44" />
                <Skeleton className="admin-shimmer h-3.5 w-64" />
              </div>
              <Skeleton className="admin-shimmer h-9 w-32 rounded-md" />
            </div>
            <AdminProjectsShimmer count={3} />
          </Card>
        </main>
      </div>
    </div>
  );
}
