"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { FormEvent} from "react";
import { useId, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageContent } from "@/components/ui/page-content";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { createUser } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import type { Role } from "@/lib/types";

export default function NewUserPage() {
  const router = useRouter();
  const nameId = useId();
  const usernameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const roleId = useId();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (user) => router.push(`/users/${user.id}`),
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await mutation.mutateAsync({ name, username, email, password, role });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao criar conta");
    }
  }

  return (
    <PageContent variant="form">
      <PageHeader
        eyebrow="Contas"
        title="Nova conta"
        description="Crie uma conta com papel e senha inicial."
        backHref="/users"
      />

      <Card as="form" onSubmit={onSubmit} className="space-y-5">
        <FormField id={nameId} label="Nome">
          <Input
            id={nameId}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            invalid={Boolean(error)}
          />
        </FormField>

        <FormField id={usernameId} label="Username">
          <Input
            id={usernameId}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            invalid={Boolean(error)}
          />
        </FormField>

        <FormField id={emailId} label="E-mail">
          <Input
            id={emailId}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={Boolean(error)}
          />
        </FormField>

        <FormField
          id={passwordId}
          label="Senha inicial"
          hint="Mínimo de 6 caracteres"
        >
          <Input
            id={passwordId}
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={Boolean(error)}
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

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Button type="submit" loading={mutation.isPending}>
          {mutation.isPending ? "Criando…" : "Criar conta"}
        </Button>
      </Card>
    </PageContent>
  );
}
