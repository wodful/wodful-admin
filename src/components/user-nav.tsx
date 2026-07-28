"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";

export const USER_TABS = [
  { id: "overview", label: "Visão geral" },
  { id: "profile", label: "Perfil" },
  { id: "finance", label: "Financeiro" },
] as const;

export type UserTabId = (typeof USER_TABS)[number]["id"];

export function isUserTabId(value: string | null): value is UserTabId {
  return USER_TABS.some((tab) => tab.id === value);
}

type UserNavProps = {
  userId: string;
};

export function UserNav({ userId }: UserNavProps) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab");
  const active: UserTabId = isUserTabId(raw) ? raw : "overview";

  return (
    <nav aria-label="Seções da conta" className="border-b border-gray-200">
      <div className="-mb-px flex gap-6 overflow-x-auto" role="tablist">
        {USER_TABS.map((tab) => {
          const isActive = active === tab.id;
          const href =
            tab.id === "overview"
              ? `/users/${userId}`
              : `/users/${userId}?tab=${tab.id}`;

          return (
            <Link
              key={tab.id}
              href={href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors",
                isActive
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
