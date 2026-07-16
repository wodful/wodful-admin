import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type ButtonLinkProps = {
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
  children: ReactNode;
};

const variantClasses = {
  primary:
    "bg-primary text-white shadow-cta hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  secondary:
    "border border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30",
};

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-all duration-200",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
