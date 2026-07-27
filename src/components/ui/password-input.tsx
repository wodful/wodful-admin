"use client";

import type { InputHTMLAttributes } from "react";
import { useId, useState } from "react";

import { inputClassName } from "@/components/ui/form-field";
import { cn } from "@/lib/cn";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  invalid?: boolean;
};

export function PasswordInput({
  invalid,
  className,
  id,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="relative">
      <input
        id={inputId}
        type={visible ? "text" : "password"}
        className={cn(inputClassName(invalid), "pr-20", className)}
        aria-invalid={invalid || undefined}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex min-w-[72px] items-center justify-center px-3 text-xs font-medium text-gray-500 transition-colors hover:text-primary"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}
