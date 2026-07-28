"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";

export const EVENT_TABS = [
  { id: "overview", label: "Visão geral" },
  { id: "finance", label: "Financeiro" },
  { id: "tickets", label: "Ingressos" },
  { id: "coupons", label: "Cupons" },
] as const;

export type EventTabId = (typeof EVENT_TABS)[number]["id"];

export function isEventTabId(value: string | null): value is EventTabId {
  return EVENT_TABS.some((tab) => tab.id === value);
}

type EventNavProps = {
  eventId: string;
};

export function EventNav({ eventId }: EventNavProps) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab");
  const active: EventTabId = isEventTabId(raw) ? raw : "overview";

  return (
    <nav aria-label="Seções do evento" className="border-b border-gray-200">
      <div className="-mb-px flex gap-6 overflow-x-auto" role="tablist">
        {EVENT_TABS.map((tab) => {
          const isActive = active === tab.id;
          const href =
            tab.id === "overview"
              ? `/events/${eventId}`
              : `/events/${eventId}?tab=${tab.id}`;

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
