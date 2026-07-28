"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconSecurity } from "@/components/ui/icons";
import { useAuth } from "@/contexts/auth";

export function TwoFactorRecommendationBanner() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || user.totpEnabled) return null;
  // Já está na página de configuração — evita repetir o mesmo aviso.
  if (pathname.startsWith("/account/security")) return null;

  return (
    <div
      role="status"
      className="border-t border-gray-200 bg-white px-4 py-2.5 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2.5">
          <span className="mt-0.5 hidden text-gray-400 sm:inline" aria-hidden>
            <IconSecurity />
          </span>
          <p className="text-sm leading-relaxed text-gray-600">
            <span className="font-medium text-gray-800">Ative o 2FA</span>
            {" — "}
            recomendado para proteger o painel.
          </p>
        </div>
        <Link
          href="/account/security"
          className="inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 transition-colors hover:border-primary/40 hover:text-primary"
        >
          Configurar
        </Link>
      </div>
    </div>
  );
}
