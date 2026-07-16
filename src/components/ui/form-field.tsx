import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export const inputClassName = (invalid?: boolean) =>
  cn(
    "min-h-[44px] w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
    invalid && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
  );

export const selectClassName = (invalid?: boolean) =>
  cn(inputClassName(invalid), "cursor-pointer");

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <span id={`${id}-hint`} className="text-sm text-gray-500">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
