"use client";

import Image from "next/image";
import type { FormEvent} from "react";
import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { getAuthErrorMessage, useAuth } from "@/contexts/auth";
import { cn } from "@/lib/cn";

const darkInputClass =
  "min-h-[48px] w-full rounded-lg border border-white/12 bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/35 transition focus:border-primary focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/users");
    }
  }, [isLoading, isAuthenticated, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/users");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return <LoadingState fullScreen label="Verificando sessão…" />;
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-blue-dark">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgba(49,151,149,0.28),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(49,151,149,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] sm:bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,black,transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-12 sm:px-6">
        <h1 className="sr-only">Wodful — login</h1>

        <Image
          src="/wodful-logo.svg"
          alt="Wodful"
          width={180}
          height={70}
          priority
          unoptimized
          className="animate-fade-in-up mb-10 h-14 w-auto sm:h-16"
        />

        <div className="animate-fade-in-up animate-delay-200 relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-6 shadow-glow backdrop-blur-md sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />

          <form
            onSubmit={onSubmit}
            className="relative space-y-5"
            aria-label="Login"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={emailId}
                className="text-sm font-medium text-gray-200"
              >
                E-mail
              </label>
              <input
                id={emailId}
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="voce@wodful.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? "login-error" : undefined}
                className={cn(darkInputClass, error && "border-red-400/70")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={passwordId}
                className="text-sm font-medium text-gray-200"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? "login-error" : undefined}
                  className={cn(
                    darkInputClass,
                    "pr-12",
                    error && "border-red-400/70",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1.5 top-1/2 inline-flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error ? (
              <p
                id="login-error"
                role="alert"
                className="rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" fullWidth loading={submitting}>
              {submitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.5 10.6a3 3 0 0 0 4 4M9.4 5.5A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-4.2 4.8M6.1 6.2A17.5 17.5 0 0 0 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.9-.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
