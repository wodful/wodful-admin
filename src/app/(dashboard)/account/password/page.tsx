"use client";

import { useMutation } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useId, useState } from "react";

import { AccountNav } from "@/components/account-nav";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { PageContent } from "@/components/ui/page-content";
import { PageHeader } from "@/components/ui/page-header";
import { PasswordInput } from "@/components/ui/password-input";
import { updateOwnPassword } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";

export default function OwnPasswordPage() {
  const currentId = useId();
  const newId = useId();
  const confirmId = useId();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [newError, setNewError] = useState<string | null>(null);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: () => updateOwnPassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFormError(null);
      setConfirmError(null);
      setNewError(null);
      setTouchedConfirm(false);
      setMessage("Senha atualizada");
    },
    onError: (err) => {
      setMessage(null);
      setFormError(
        err instanceof ApiError ? err.message : "Erro ao atualizar senha",
      );
    },
  });

  function validateNew(value: string) {
    if (value.length > 0 && value.length < 6) {
      setNewError("Mínimo de 6 caracteres");
    } else {
      setNewError(null);
    }
  }

  function validateConfirm(nextConfirm: string, nextNew = newPassword) {
    if (!touchedConfirm && nextConfirm.length === 0) {
      setConfirmError(null);
      return;
    }
    if (nextConfirm.length > 0 && nextConfirm !== nextNew) {
      setConfirmError("A confirmação não confere");
    } else {
      setConfirmError(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setTouchedConfirm(true);

    if (newPassword.length < 6) {
      setNewError("Mínimo de 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError("A confirmação não confere");
      return;
    }

    setNewError(null);
    setConfirmError(null);
    setFormError(null);
    mutation.mutate();
  }

  return (
    <PageContent>
      <PageHeader
        eyebrow="Conta"
        title="Minha senha"
        description="Altere a senha da sua conta administrativa."
      />

      <AccountNav />

      <Card as="form" onSubmit={onSubmit} className="space-y-5">
        <FormField id={currentId} label="Senha atual">
          <PasswordInput
            id={currentId}
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setFormError(null);
            }}
            invalid={Boolean(formError)}
          />
        </FormField>

        <FormField
          id={newId}
          label="Nova senha"
          hint={!newError ? "Mínimo de 6 caracteres" : undefined}
          error={newError ?? undefined}
        >
          <PasswordInput
            id={newId}
            required
            minLength={6}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => {
              const value = e.target.value;
              setNewPassword(value);
              setFormError(null);
              validateNew(value);
              validateConfirm(confirmPassword, value);
            }}
            invalid={Boolean(newError)}
          />
        </FormField>

        <FormField
          id={confirmId}
          label="Confirmar nova senha"
          error={confirmError ?? undefined}
        >
          <PasswordInput
            id={confirmId}
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setConfirmPassword(value);
              setTouchedConfirm(true);
              setFormError(null);
              validateConfirm(value);
            }}
            invalid={Boolean(confirmError)}
          />
        </FormField>

        {message ? <Alert variant="success">{message}</Alert> : null}
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <Button
          type="submit"
          loading={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? "Salvando…" : "Atualizar senha"}
        </Button>
      </Card>
    </PageContent>
  );
}
