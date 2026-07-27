import Image from "next/image";
import type { ReactNode } from "react";

type AuthShellProps = {
  headline: string;
  children: ReactNode;
};

export function AuthShell({ headline, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      <main className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-10 lg:order-1 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </main>

      <aside className="relative flex shrink-0 flex-col justify-between overflow-hidden bg-blue-dark px-6 py-8 text-white sm:px-10 lg:order-2 lg:w-[42%] lg:px-12 lg:py-12 xl:w-[40%]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_0%,rgba(13,148,136,0.24),transparent_55%)]"
          aria-hidden
        />

        <div className="relative">
          <Image
            src="/wodful-mark.svg"
            alt="Wodful"
            width={40}
            height={40}
            priority
            unoptimized
            className="h-10 w-10"
          />
        </div>

        <div className="relative mt-10 max-w-sm lg:mt-0 lg:pb-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Wodful
          </p>
          <p className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2rem]">
            {headline}
          </p>
        </div>

        <div className="relative mt-8 text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} Fortis CyberIntell. Todos os direitos
            reservados.
          </p>
        </div>
      </aside>
    </div>
  );
}
