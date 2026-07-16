import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Voltar",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-4", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex min-h-[44px] cursor-pointer items-center text-sm font-medium text-gray-500 transition-colors hover:text-primary"
        >
          ← {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
