"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/ui/auth-shell";
import { Button } from "@/components/ui/button";
import { FormField, inputClassName } from "@/components/ui/form-field";
import { LoadingState } from "@/components/ui/loading-state";
import { getAuthErrorMessage, useAuth } from "@/contexts/auth";
import { cn } from "@/lib/cn";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const totpId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [requires2fa, setRequires2fa] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isCredentialsEmpty = !email.length || !password.length;
  const isTotpEmpty = totpCode.trim().length < 6;
  const isEmpty = requires2fa ? isTotpEmpty : isCredentialsEmpty;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (isEmpty || submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const result = await login(
        email,
        password,
        requires2fa ? totpCode.trim() : undefined,
      );
      if (result.requires2fa) {
        setRequires2fa(true);
        setTotpCode("");
        return;
      }
      router.replace("/dashboard");
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
    <AuthShell headline="Operações da plataforma com clareza e controle.">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-8"
        aria-label="Login do admin"
        noValidate
      >
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {requires2fa ? "Verificação em duas etapas" : "Entrar no admin"}
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500">
            {requires2fa
              ? "Digite o código do autenticador para concluir o login."
              : "Use o e-mail e a senha da sua conta de administrador."}
          </p>
        </div>

        <div className="space-y-4">
          {!requires2fa ? (
            <>
              <FormField id={emailId} label="E-mail">
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
                  className={inputClassName(Boolean(error))}
                />
              </FormField>

              <FormField id={passwordId} label="Senha">
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
                    className={cn(inputClassName(Boolean(error)), "pr-12")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-1.5 top-1/2 inline-flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </FormField>
            </>
          ) : (
            <div className="space-y-3">
              <FormField id={totpId} label="Código 2FA">
                <input
                  id={totpId}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  autoFocus
                  minLength={6}
                  maxLength={8}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\s/g, ""))
                  }
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? "login-error" : undefined}
                  className={cn(
                    inputClassName(Boolean(error)),
                    "tracking-[0.3em]",
                  )}
                />
              </FormField>
              <button
                type="button"
                className="text-sm font-medium text-primary transition hover:text-primary-hover"
                onClick={() => {
                  setRequires2fa(false);
                  setTotpCode("");
                  setError(null);
                }}
              >
                Voltar
              </button>
            </div>
          )}

          {error ? (
            <p id="login-error" role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            fullWidth
            loading={submitting}
            disabled={isEmpty || submitting}
            className="mt-2"
          >
            {requires2fa ? "Confirmar código" : "Continuar"}
          </Button>
        </div>
      </form>
    </AuthShell>
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
