"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useId, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageContent } from "@/components/ui/page-content";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { FormSkeleton, Skeleton } from "@/components/ui/skeleton";
import {
  PaymentStatusBadge,
  StatusBadge,
} from "@/components/ui/user-badges";
import {
  getUser,
  getUserOverview,
  impersonateUser,
  resetUserPassword,
  updateUser,
  updateUserDefaultFee,
  updateUserStatus,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
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
  const defaultFeeId = useId();

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
  });

  const { data: overview } = useQuery({
    queryKey: ["user-overview", id],
    queryFn: () => getUserOverview(id),
  });

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [newPassword, setNewPassword] = useState("");
  const [defaultWodfulFeePercent, setDefaultWodfulFeePercent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
  }, [user]);

  useEffect(() => {
    if (!overview) return;
    setDefaultWodfulFeePercent(
      overview.user.defaultWodfulFeePercent == null
        ? ""
        : String(overview.user.defaultWodfulFeePercent),
    );
  }, [overview]);

  const saveMutation = useMutation({
    mutationFn: () => updateUser(id, { name, username, email, role }),
    onSuccess: async () => {
      setMessage("Perfil atualizado");
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["user", id] });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["user-overview", id] });
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

  const feeMutation = useMutation({
    mutationFn: () =>
      updateUserDefaultFee(
        id,
        defaultWodfulFeePercent === ""
          ? null
          : Number(defaultWodfulFeePercent),
      ),
    onSuccess: async () => {
      setMessage("Comissão padrão atualizada");
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["user", id] });
      await queryClient.invalidateQueries({ queryKey: ["user-overview", id] });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      setMessage(null);
      setErrorMessage(
        err instanceof ApiError ? err.message : "Erro ao atualizar comissão",
      );
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: () => impersonateUser(id),
    onSuccess: (result) => {
      setMessage("Sessão de impersonação criada");
      setErrorMessage(null);
      window.open(result.webUrl, "_blank", "noopener,noreferrer");
    },
    onError: (err) => {
      setMessage(null);
      setErrorMessage(
        err instanceof ApiError ? err.message : "Erro ao impersonar",
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

  function onSaveDefaultFee(event: FormEvent) {
    event.preventDefault();
    feeMutation.mutate();
  }

  if (isLoading) {
    return (
      <PageContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Card>
          <FormSkeleton />
        </Card>
      </PageContent>
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
    <PageContent>
      <PageHeader
        eyebrow="Contas"
        title={user.name}
        description={user.email}
        backHref="/users"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge isActive={user.isActive} />
            <Button
              variant="secondary"
              loading={impersonateMutation.isPending}
              onClick={() => impersonateMutation.mutate()}
            >
              Impersonar
            </Button>
          </div>
        }
      />

      {message ? <Alert variant="success">{message}</Alert> : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      {overview ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Eventos" value={overview.metrics.championshipsCount} />
          <Metric
            label="Inscrições aprovadas"
            value={overview.metrics.subscriptionsApproved}
          />
          <Metric
            label="Inscrições aguardando"
            value={overview.metrics.subscriptionsWaiting}
          />
          <Metric
            label="Receita online"
            value={formatMoney(overview.metrics.revenuePaid)}
          />
        </div>
      ) : null}

      <Card
        as="form"
        title="Perfil"
        description="Dados e papel da conta."
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

      <div className="grid gap-6 sm:grid-cols-2">
        <Card
          title="Status"
          description={`Conta ${user.isActive ? "ativa" : "inativa"}.`}
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
          title="Senha"
          description="Redefinir acesso desta conta."
          onSubmit={onResetPassword}
          className="space-y-4"
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

      {overview ? (
        <>
          <Card
            title="Eventos"
            description="Abra o detalhe para financeiro completo."
          >
            {overview.championships.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum evento.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {overview.championships.map((event) => (
                  <li key={event.id} className="py-3 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/events/${event.id}`}
                          className="font-medium text-primary underline-offset-2 hover:underline"
                        >
                          {event.name}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {event.accessCode} · {formatDate(event.startDate)} –{" "}
                          {formatDate(event.endDate)}
                        </p>
                      </div>
                      <StatusBadge isActive={event.isActive} />
                    </div>
                    <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                      <div>
                        <dt className="inline text-gray-400">Comissão: </dt>
                        <dd className="inline font-medium text-gray-800">
                          {event.wodfulFeePercent}% ·{" "}
                          {formatMoney(event.wodfulFeeAmount)}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline text-gray-400">Receita online: </dt>
                        <dd className="inline font-medium text-gray-800">
                          {formatMoney(event.revenuePaid)}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Pagamentos recentes">
            {overview.recentPayments.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum pagamento recente.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {overview.recentPayments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div>
                      <Link
                        href={`/payments/${payment.id}`}
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {formatMoney(payment.amountFinal)}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {payment.championship?.name ?? "—"} ·{" "}
                        {formatDateTime(payment.createdAt)}
                      </p>
                    </div>
                    <PaymentStatusBadge status={payment.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : null}

      <Card
        as="form"
        title="Comissão padrão"
        description="Usada em novos eventos desta conta. Ajuste fino no detalhe de cada evento."
        onSubmit={onSaveDefaultFee}
        className="space-y-5"
      >
        <FormField
          id={defaultFeeId}
          label="Comissão Wodful (%)"
          hint={`Vazio = padrão da plataforma (${overview?.user.platformDefaultWodfulFeePercent ?? 12}%)`}
        >
          <Input
            id={defaultFeeId}
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={defaultWodfulFeePercent}
            onChange={(event) =>
              setDefaultWodfulFeePercent(event.target.value)
            }
            placeholder={String(
              overview?.user.platformDefaultWodfulFeePercent ?? 12,
            )}
          />
        </FormField>
        <Button type="submit" loading={feeMutation.isPending}>
          Salvar comissão
        </Button>
      </Card>
    </PageContent>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padding="compact">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-gray-900">
        {value}
      </p>
    </Card>
  );
}
