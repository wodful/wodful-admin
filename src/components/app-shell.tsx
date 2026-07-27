"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { TwoFactorRecommendationBanner } from "@/components/two-factor-banner";
import { Button } from "@/components/ui/button";
import {
  IconAudit,
  IconClose,
  IconDashboard,
  IconEvents,
  IconHealth,
  IconMenu,
  IconPayments,
  IconSecurity,
  IconSubscriptions,
  IconUsers,
} from "@/components/ui/icons";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  /** Match active state for nested routes (e.g. /account/*) */
  matchPrefix?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Operação",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
      { href: "/events", label: "Eventos", icon: <IconEvents /> },
      { href: "/users", label: "Contas", icon: <IconUsers /> },
      {
        href: "/subscriptions",
        label: "Inscrições",
        icon: <IconSubscriptions />,
      },
      { href: "/payments", label: "Pagamentos", icon: <IconPayments /> },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/audit", label: "Auditoria", icon: <IconAudit /> },
      { href: "/health", label: "Saúde", icon: <IconHealth /> },
      {
        href: "/account/security",
        label: "Conta",
        icon: <IconSecurity />,
        matchPrefix: "/account",
      },
    ],
  },
];

function isActivePath(pathname: string, item: NavItem) {
  if (item.matchPrefix) {
    return (
      pathname === item.matchPrefix ||
      pathname.startsWith(`${item.matchPrefix}/`)
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function currentPageLabel(pathname: string) {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActivePath(pathname, item)) return item.label;
    }
  }
  return "Wodful Admin";
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const navId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (isLoading || !isAuthenticated) {
    return <LoadingState fullScreen label="Carregando painel…" />;
  }

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside
        id={navId}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[min(100%,18rem)] flex-col border-r border-white/[0.06] bg-blue-dark text-white transition-transform duration-200 lg:static lg:w-64 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navegação principal"
      >
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Image
              src="/wodful-logo.svg"
              alt="Wodful Admin"
              width={92}
              height={36}
              priority
              unoptimized
              className="h-8 w-auto sm:h-9"
            />
          </Link>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-white/80 hover:bg-white/5 lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          >
            <IconClose />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Menu">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/15 text-primary"
                            : "text-white/75 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <span
                          className={cn(
                            "shrink-0",
                            active ? "text-primary" : "text-white/45",
                          )}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <div className="rounded-lg bg-white/[0.04] px-3 py-3">
            <p className="truncate text-sm font-medium text-white">
              {user?.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-white/50">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            className="mt-3 w-full border-white/15 text-sm text-white hover:bg-white/5"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Sair
          </Button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-blue-dark/60 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 lg:hidden"
                aria-expanded={mobileOpen}
                aria-controls={navId}
                onClick={() => setMobileOpen((open) => !open)}
              >
                <span className="sr-only">Abrir menu</span>
                <IconMenu />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 lg:hidden">
                  {currentPageLabel(pathname)}
                </p>
                <p className="hidden text-sm text-gray-500 lg:block">
                  Painel de administração
                </p>
              </div>
            </div>
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium text-gray-800">
                {user?.name}
              </p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <TwoFactorRecommendationBanner />
        </header>

        <main
          id="main-content"
          className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
        >
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
