import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Status chips next to the title */
  badges?: ReactNode;
  /** Primary page actions (right side on desktop) */
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Voltar",
  badges,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex min-h-[40px] cursor-pointer items-center text-sm font-medium text-gray-500 transition-colors hover:text-primary"
        >
          ← {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-[1.75rem]">
              {title}
            </h1>
            {badges ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {badges}
              </div>
            ) : null}
          </div>
          {description ? (
            <div className="max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-[0.95rem]">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
