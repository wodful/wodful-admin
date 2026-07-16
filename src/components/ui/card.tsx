import type { FormHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = FormHTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "form";
  title?: string;
  description?: string;
};

export function Card({
  children,
  className,
  as: Component = "div",
  title,
  description,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm",
        className,
      )}
      {...props}
    >
      {(title || description) && (
        <header className="mb-5 space-y-1">
          {title ? (
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-sm text-gray-500">{description}</p>
          ) : null}
        </header>
      )}
      {children}
    </Component>
  );
}
