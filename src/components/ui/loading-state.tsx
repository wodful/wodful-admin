import { cn } from "@/lib/cn";

type LoadingStateProps = {
  label?: string;
  className?: string;
  fullScreen?: boolean;
};

export function LoadingState({
  label = "Carregando…",
  className,
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex items-center justify-center gap-3 text-sm text-gray-500",
        fullScreen && "min-h-screen bg-surface",
        className,
      )}
    >
      <span
        className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}
