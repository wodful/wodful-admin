import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  href?: string;
  tone?: "default" | "accent" | "warning" | "muted";
  className?: string;
};

const toneClasses = {
  default: "border-gray-200/80 bg-white",
  accent: "border-primary/20 bg-primary/[0.04]",
  warning: "border-amber-200/80 bg-amber-50/50",
  muted: "border-gray-200/60 bg-gray-50/80",
} as const;

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
  className,
}: StatCardProps) {
  const content = (
    <>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
    </>
  );

  const classes = cn(
    "block w-full rounded-xl border p-4 sm:p-5 transition-colors",
    toneClasses[tone],
    href && "hover:border-primary/35 hover:bg-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

type SectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Section({
  title,
  description,
  action,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {description ? (
            <p className="text-sm text-gray-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
