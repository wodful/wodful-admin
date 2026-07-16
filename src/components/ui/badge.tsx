import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "primary" | "success" | "muted" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-gray-200 bg-gray-100 text-gray-700",
  primary: "border-primary/30 bg-primary/10 text-primary",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  muted: "border-gray-200 bg-gray-50 text-gray-500",
  danger: "border-red-200 bg-red-50 text-red-700",
};

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
