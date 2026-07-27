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
      className="border-t border-primary/15 bg-primary/[0.06] px-4 py-3 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 hidden text-primary sm:inline" aria-hidden>
            <IconSecurity />
          </span>
          <p className="text-sm leading-relaxed text-gray-700">
            <span className="font-semibold text-gray-900">
              Recomendamos ativar o 2FA.
            </span>{" "}
            Não é obrigatório, mas protege o painel mesmo se a senha vazar.
          </p>
        </div>
        <Link
          href="/account/security"
          className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Ativar 2FA
        </Link>
      </div>
    </div>
  );
}
