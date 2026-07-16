import type { SelectHTMLAttributes } from "react";

import { selectClassName } from "@/components/ui/form-field";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function Select({ invalid, className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(selectClassName(invalid), className)}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
}
