import { cn } from "@/lib/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200/80",
        className,
      )}
      aria-hidden
    />
  );
}

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
};

export function TableSkeleton({ rows = 6, columns = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-100 last:border-0">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <td key={colIndex} className="px-4 py-3.5">
              <Skeleton
                className={cn(
                  "h-4",
                  colIndex === 0 ? "w-32" : colIndex === columns - 1 ? "ml-auto w-14" : "w-24",
                )}
              />
              {colIndex === 0 ? (
                <Skeleton className="mt-2 h-3 w-20" />
              ) : null}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="h-11 w-32" />
    </div>
  );
}
