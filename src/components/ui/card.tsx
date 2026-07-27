import type { FormHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardPadding = "default" | "compact" | "flush";

type CardProps = FormHTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "form";
  title?: string;
  description?: string;
  /** default = p-6; compact = filtros/métricas; flush = tabelas */
  padding?: CardPadding;
};

const paddingClasses: Record<CardPadding, string> = {
  default: "p-6",
  compact: "p-4 sm:p-5",
  flush: "p-0",
};

const headerPaddingClasses: Record<CardPadding, string> = {
  default: "mb-5",
  compact: "mb-4",
  flush: "mb-0 px-4 pt-4 sm:px-5 sm:pt-5",
};

export function Card({
  children,
  className,
  as: Component = "div",
  title,
  description,
  padding = "default",
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "w-full rounded-xl border border-gray-200/80 bg-white shadow-sm",
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {(title || description) && (
        <header className={cn("space-y-1", headerPaddingClasses[padding])}>
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
