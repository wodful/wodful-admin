"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/users", label: "Contas" },
  { href: "/account/password", label: "Minha senha" },
];

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

  if (isLoading || !isAuthenticated) {
    return <LoadingState fullScreen label="Carregando painel…" />;
  }

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.06] bg-blue-dark text-white transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navegação principal"
      >
        <div className="flex h-16 items-center border-b border-white/[0.06] px-5">
          <Link href="/users" className="flex items-center gap-3">
            <Image
              src="/wodful-logo.svg"
              alt="Wodful"
              width={92}
              height={36}
              priority
              unoptimized
              className="h-9 w-auto"
            />
          </Link>
        </div>

        <nav id={navId} className="flex-1 space-y-1 p-3" aria-label="Menu">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-white/80 hover:bg-white/5 hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="truncate text-xs text-gray-400">{user?.email}</p>
          <Button
            variant="ghost"
            className="mt-3 w-full border-white/15 text-sm"
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
          className="fixed inset-0 z-30 bg-blue-dark/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 backdrop-blur-sm lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="menu-toggle inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls={navId}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span className="sr-only">Abrir menu</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 5H17M3 10H17M3 15H17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <p className="text-sm font-medium text-gray-500 lg:hidden">
              Wodful Admin
            </p>
          </div>
          <p className="hidden text-sm text-gray-500 sm:block">
            {user?.name}
          </p>
        </header>

        <main
          id="main-content"
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
