"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { FormEvent} from "react";
import { useEffect, useId, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { FormSkeleton, Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/user-badges";
import {
  getUser,
  resetUserPassword,
  updateUser,
  updateUserStatus,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import type { Role } from "@/lib/types";

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const nameId = useId();
  const usernameId = useId();
  const emailId = useId();
  const roleId = useId();
  const passwordId = useId();

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
  });

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: () => updateUser(id, { name, username, email, role }),
    onSuccess: async () => {
      setMessage("Perfil atualizado");
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["user", id] });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      setMessage(null);
      setErrorMessage(err instanceof ApiError ? err.message : "Erro ao salvar");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (isActive: boolean) => updateUserStatus(id, isActive),
    onSuccess: async () => {
      setMessage("Status atualizado");
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["user", id] });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      setMessage(null);
      setErrorMessage(
        err instanceof ApiError ? err.message : "Erro ao atualizar status",
      );
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => resetUserPassword(id, newPassword),
    onSuccess: () => {
      setNewPassword("");
      setMessage("Senha redefinida");
      setErrorMessage(null);
    },
    onError: (err) => {
      setMessage(null);
      setErrorMessage(
        err instanceof ApiError ? err.message : "Erro ao redefinir senha",
      );
    },
  });

  function onSave(event: FormEvent) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function onResetPassword(event: FormEvent) {
    event.preventDefault();
    passwordMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Card>
          <FormSkeleton />
        </Card>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <Alert variant="error">
        {(error as Error)?.message ?? "Conta não encontrada"}
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Contas"
        title={user.name}
        description={user.email}
        backHref="/users"
        actions={<StatusBadge isActive={user.isActive} />}
      />

      {message ? <Alert variant="success">{message}</Alert> : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      <Card
        as="form"
        title="Perfil"
        description="Atualize dados e papel da conta."
        onSubmit={onSave}
        className="space-y-5"
      >
        <FormField id={nameId} label="Nome">
          <Input
            id={nameId}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>

        <FormField id={usernameId} label="Username">
          <Input
            id={usernameId}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormField>

        <FormField id={emailId} label="E-mail">
          <Input
            id={emailId}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>

        <FormField id={roleId} label="Papel">
          <Select
            id={roleId}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="USER">Organizador</option>
            <option value="ADMIN">Admin</option>
            <option value="NO_ACCESS">Sem acesso</option>
          </Select>
        </FormField>

        <Button type="submit" loading={saveMutation.isPending}>
          {saveMutation.isPending ? "Salvando…" : "Salvar perfil"}
        </Button>
      </Card>

      <Card
        title="Status"
        description={`Conta atualmente ${user.isActive ? "ativa" : "inativa"}.`}
      >
        <Button
          type="button"
          variant="secondary"
          loading={statusMutation.isPending}
          onClick={() => statusMutation.mutate(!user.isActive)}
        >
          {user.isActive ? "Desativar conta" : "Ativar conta"}
        </Button>
      </Card>

      <Card
        as="form"
        title="Redefinir senha"
        description="Defina uma nova senha para esta conta."
        onSubmit={onResetPassword}
        className="space-y-5"
      >
        <FormField id={passwordId} label="Nova senha" hint="Mínimo de 6 caracteres">
          <Input
            id={passwordId}
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </FormField>

        <Button
          type="submit"
          variant="secondary"
          loading={passwordMutation.isPending}
          disabled={newPassword.length < 6}
        >
          {passwordMutation.isPending ? "Salvando…" : "Definir nova senha"}
        </Button>
      </Card>
    </div>
  );
}
