import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type PageContentProps = {
  children: ReactNode;
  /** default = largura do shell; form = coluna estreita alinhada à esquerda */
  variant?: "default" | "form";
  className?: string;
};

export function PageContent({
  children,
  variant = "default",
  className,
}: PageContentProps) {
  return (
    <div
      className={cn(
        "w-full space-y-6",
        variant === "form" && "max-w-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
