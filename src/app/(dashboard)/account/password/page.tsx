"use client";

import { useMutation } from "@tanstack/react-query";
import type { FormEvent} from "react";
import { useId, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
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
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => updateOwnPassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setMessage("Senha atualizada");
    },
    onError: (err) => {
      setMessage(null);
      setError(err instanceof ApiError ? err.message : "Erro ao atualizar senha");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("A confirmação não confere com a nova senha");
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        eyebrow="Conta"
        title="Minha senha"
        description="Altere a senha da sua conta administrativa."
      />

      <Card as="form" onSubmit={onSubmit} className="space-y-5">
        <FormField id={currentId} label="Senha atual">
          <Input
            id={currentId}
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            invalid={Boolean(error)}
          />
        </FormField>

        <FormField id={newId} label="Nova senha" hint="Mínimo de 6 caracteres">
          <Input
            id={newId}
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            invalid={Boolean(error)}
          />
        </FormField>

        <FormField id={confirmId} label="Confirmar nova senha">
          <Input
            id={confirmId}
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            invalid={Boolean(error)}
          />
        </FormField>

        {message ? <Alert variant="success">{message}</Alert> : null}
        {error ? <Alert variant="error">{error}</Alert> : null}

        <Button type="submit" loading={mutation.isPending}>
          {mutation.isPending ? "Salvando…" : "Atualizar senha"}
        </Button>
      </Card>
    </div>
  );
}
