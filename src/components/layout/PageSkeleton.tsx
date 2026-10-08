import { Skeleton } from "@/components/ui/primitives";

export function PageSkeleton() {
  return (
    <div className="container-page py-8" role="status" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <Skeleton className="mb-3 h-8 w-64" />
      <Skeleton className="mb-8 h-4 w-96 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
