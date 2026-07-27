"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const tabs = [
  { href: "/account/security", label: "Segurança" },
  { href: "/account/password", label: "Senha" },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Conta" className="border-b border-gray-200">
      <div className="flex gap-8" role="tablist">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={active}
              className={cn(
                "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
