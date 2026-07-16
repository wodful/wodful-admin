import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/components/providers";
import { SkipLink } from "@/components/ui/skip-link";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wodful | Administração",
    template: "%s · Wodful | Administração",
  },
  description: "Painel de administração da plataforma Wodful",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
