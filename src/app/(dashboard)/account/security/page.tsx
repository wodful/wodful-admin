"use client";

import { useMutation } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useId, useState } from "react";

import { AccountNav } from "@/components/account-nav";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageContent } from "@/components/ui/page-content";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/contexts/auth";
import { disableTotp, setupTotp, verifyTotp } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import type { TotpSetupResponse } from "@/lib/types";

export default function SecurityPage() {
  const { user, refreshMe } = useAuth();
  const verifyId = useId();
  const disableId = useId();
  const [setup, setSetup] = useState<TotpSetupResponse | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const setupMutation = useMutation({
    mutationFn: setupTotp,
    onSuccess: (data) => {
      setSetup(data);
      setActionError(null);
      setActionSuccess(null);
    },
    onError: (err) => {
      setActionSuccess(null);
      setActionError(
        err instanceof ApiError ? err.message : "Erro ao iniciar 2FA",
      );
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyTotp(verifyCode.trim()),
    onSuccess: async () => {
      setSetup(null);
      setVerifyCode("");
      setActionError(null);
      setActionSuccess("2FA ativado com sucesso");
      await refreshMe();
    },
    onError: (err) => {
      setActionSuccess(null);
      setActionError(
        err instanceof ApiError ? err.message : "Código inválido",
      );
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => disableTotp(disableCode.trim()),
    onSuccess: async () => {
      setDisableCode("");
      setSetup(null);
      setActionError(null);
      setActionSuccess("2FA desativado");
      await refreshMe();
    },
    onError: (err) => {
      setActionSuccess(null);
      setActionError(
        err instanceof ApiError ? err.message : "Não foi possível desativar",
      );
    },
  });

  const totpEnabled = Boolean(user?.totpEnabled);

  function onVerify(event: FormEvent) {
    event.preventDefault();
    verifyMutation.mutate();
  }

  function onDisable(event: FormEvent) {
    event.preventDefault();
    disableMutation.mutate();
  }

  function cancelSetup() {
    setSetup(null);
    setVerifyCode("");
    setActionError(null);
  }

  return (
    <PageContent>
      <PageHeader
        eyebrow="Conta"
        title="Segurança"
        description="Proteja o acesso ao painel com autenticação em dois fatores."
      />

      <AccountNav />

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">2FA</h2>
            <p className="mt-1 text-sm text-gray-500">
              {totpEnabled
                ? "No próximo login será pedido o código do autenticador."
                : "Opcional. Recomendado se a senha vazar."}
            </p>
          </div>
          <Badge variant={totpEnabled ? "success" : "muted"}>
            {totpEnabled ? "Ativado" : "Desativado"}
          </Badge>
        </div>

        {actionSuccess ? <Alert variant="success">{actionSuccess}</Alert> : null}
        {actionError ? <Alert variant="error">{actionError}</Alert> : null}

        {!totpEnabled ? (
          !setup ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Use Google Authenticator, 1Password, Authy ou similar.
              </p>
              <Button
                loading={setupMutation.isPending}
                onClick={() => {
                  setActionError(null);
                  setActionSuccess(null);
                  setupMutation.mutate();
                }}
              >
                Ativar 2FA
              </Button>
            </div>
          ) : (
            <ol className="space-y-5">
              <li className="space-y-3">
                <p className="text-sm font-medium text-gray-900">
                  1. Escaneie o QR no autenticador
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setup.otpauthUrl)}`}
                  alt="QR Code para autenticador"
                  width={180}
                  height={180}
                  className="rounded-lg border border-gray-200 bg-white p-2"
                />
                <FormField
                  id="totp-secret"
                  label="Ou digite o segredo manualmente"
                >
                  <Input
                    id="totp-secret"
                    readOnly
                    value={setup.secret}
                    onFocus={(e) => e.currentTarget.select()}
                  />
                </FormField>
              </li>

              <li>
                <form onSubmit={onVerify} className="space-y-3">
                  <p className="text-sm font-medium text-gray-900">
                    2. Confirme com o código de 6 dígitos
                  </p>
                  <FormField id={verifyId} label="Código do autenticador">
                    <Input
                      id={verifyId}
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      minLength={6}
                      maxLength={8}
                      value={verifyCode}
                      onChange={(e) => {
                        setVerifyCode(e.target.value.replace(/\s/g, ""));
                        setActionError(null);
                      }}
                    />
                  </FormField>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" loading={verifyMutation.isPending}>
                      Confirmar e ativar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={cancelSetup}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </li>
            </ol>
          )
        ) : (
          <form onSubmit={onDisable} className="space-y-4 border-t border-gray-100 pt-5">
            <p className="text-sm text-gray-600">
              Para desativar, informe um código válido do autenticador.
            </p>
            <FormField id={disableId} label="Código 2FA">
              <Input
                id={disableId}
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                minLength={6}
                maxLength={8}
                value={disableCode}
                onChange={(e) => {
                  setDisableCode(e.target.value.replace(/\s/g, ""));
                  setActionError(null);
                }}
              />
            </FormField>
            <Button
              type="submit"
              variant="danger"
              loading={disableMutation.isPending}
            >
              Desativar 2FA
            </Button>
          </form>
        )}
      </Card>
    </PageContent>
  );
}
