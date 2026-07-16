import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-cta hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  secondary:
    "border border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30",
  ghost:
    "border border-white/20 bg-transparent text-white hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary",
  danger:
    "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-400/40",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  loading = false,
  className,
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70",
        fullWidth ? "w-full" : "w-auto",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : null}
      <span className={cn(loading && "opacity-90")}>{children}</span>
    </button>
  );
}

function Spinner() {
  return (
    <span
      className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden
    />
  );
}
