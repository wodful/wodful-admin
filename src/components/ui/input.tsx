import type { InputHTMLAttributes } from "react";

import { inputClassName } from "@/components/ui/form-field";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      className={cn(inputClassName(invalid), className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
