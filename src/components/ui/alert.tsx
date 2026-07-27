import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type AlertVariant = "error" | "success" | "info";

const variantClasses: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-primary/20 bg-primary/5 text-gray-700",
};

type AlertProps = {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
};

export function Alert({ variant = "info", children, className }: AlertProps) {
  return (
    <p
      role="alert"
      className={cn(
        "w-full rounded-xl border px-3.5 py-2.5 text-sm",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </p>
  );
}
