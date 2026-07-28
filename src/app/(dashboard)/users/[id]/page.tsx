"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Suspense, useEffect, useId, useState } from "react";

import { UserNav, isUserTabId, type UserTabId } from "@/components/user-nav";
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
  RoleBadge,
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
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import type { PublicUser, Role, UserOverview } from "@/lib/types";

export default function UserDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      }
    >
      <UserDetailPageContent />
    </Suspense>
  );
}

function UserDetailPageContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const rawTab = searchParams.get("tab");
  const tab: UserTabId = isUserTabId(rawTab) ? rawTab : "overview";

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
        description={
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a
              href={`mailto:${user.email}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              {user.email}
            </a>
            <span className="text-gray-300" aria-hidden>
              ·
            </span>
            <span>@{user.username}</span>
          </p>
        }
        backHref="/users"
        badges={
          <>
            <StatusBadge isActive={user.isActive} />
            <RoleBadge role={user.role} />
          </>
        }
        actions={
          <Button
            variant="secondary"
            loading={impersonateMutation.isPending}
            onClick={() => impersonateMutation.mutate()}
          >
            Impersonar
          </Button>
        }
      />

      <UserNav userId={id} />

      {message ? <Alert variant="success">{message}</Alert> : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      {tab === "overview" ? (
        <OverviewTab userId={id} overview={overview} />
      ) : null}

      {tab === "profile" ? (
        <ProfileTab
          user={user}
          nameId={nameId}
          usernameId={usernameId}
          emailId={emailId}
          roleId={roleId}
          passwordId={passwordId}
          name={name}
          username={username}
          email={email}
          role={role}
          newPassword={newPassword}
          setName={setName}
          setUsername={setUsername}
          setEmail={setEmail}
          setRole={setRole}
          setNewPassword={setNewPassword}
          onSave={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
          onResetPassword={(event) => {
            event.preventDefault();
            passwordMutation.mutate();
          }}
          onToggleStatus={() => statusMutation.mutate(!user.isActive)}
          savingProfile={saveMutation.isPending}
          savingPassword={passwordMutation.isPending}
          savingStatus={statusMutation.isPending}
        />
      ) : null}

      {tab === "finance" ? (
        <FinanceTab
          defaultFeeId={defaultFeeId}
          defaultWodfulFeePercent={defaultWodfulFeePercent}
          platformDefault={
            overview?.user.platformDefaultWodfulFeePercent ?? 12
          }
          setDefaultWodfulFeePercent={setDefaultWodfulFeePercent}
          onSave={(event) => {
            event.preventDefault();
            feeMutation.mutate();
          }}
          saving={feeMutation.isPending}
        />
      ) : null}
    </PageContent>
  );
}

function OverviewTab({
  userId,
  overview,
}: {
  userId: string;
  overview: UserOverview | undefined;
}) {
  if (!overview) {
    return (
      <Card padding="compact">
        <FormSkeleton />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <MetricLink
          label="Eventos"
          value={overview.metrics.championshipsCount}
          href={`/events?userId=${userId}`}
          showLink={overview.metrics.championshipsCount > 0}
        />
        <Metric
          label="Inscrições aprovadas"
          value={overview.metrics.subscriptionsApproved}
        />
        <Metric
          label="Inscrições aguardando"
          value={overview.metrics.subscriptionsWaiting}
          tone={
            overview.metrics.subscriptionsWaiting > 0 ? "warning" : "default"
          }
        />
        <Metric
          label="Receita online"
          value={formatMoney(overview.metrics.revenuePaid)}
        />
      </div>

      <Card title="Eventos" padding="compact">
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

      <Card title="Pagamentos recentes" padding="compact">
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
    </div>
  );
}

function ProfileTab({
  user,
  nameId,
  usernameId,
  emailId,
  roleId,
  passwordId,
  name,
  username,
  email,
  role,
  newPassword,
  setName,
  setUsername,
  setEmail,
  setRole,
  setNewPassword,
  onSave,
  onResetPassword,
  onToggleStatus,
  savingProfile,
  savingPassword,
  savingStatus,
}: {
  user: PublicUser;
  nameId: string;
  usernameId: string;
  emailId: string;
  roleId: string;
  passwordId: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  newPassword: string;
  setName: (value: string) => void;
  setUsername: (value: string) => void;
  setEmail: (value: string) => void;
  setRole: (value: Role) => void;
  setNewPassword: (value: string) => void;
  onSave: (event: FormEvent) => void;
  onResetPassword: (event: FormEvent) => void;
  onToggleStatus: () => void;
  savingProfile: boolean;
  savingPassword: boolean;
  savingStatus: boolean;
}) {
  return (
    <div className="max-w-xl space-y-5">
      <Card
        as="form"
        title="Perfil"
        description="Dados e papel da conta."
        onSubmit={onSave}
        className="space-y-4"
        padding="compact"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id={nameId} label="Nome" className="sm:col-span-2">
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

          <FormField id={emailId} label="E-mail" className="sm:col-span-2">
            <Input
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
        </div>

        <Button type="submit" loading={savingProfile}>
          Salvar perfil
        </Button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          title="Status"
          description={`Conta ${user.isActive ? "ativa" : "inativa"}.`}
          padding="compact"
        >
          <Button
            type="button"
            variant="secondary"
            loading={savingStatus}
            onClick={onToggleStatus}
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
          padding="compact"
        >
          <FormField
            id={passwordId}
            label="Nova senha"
            hint="Mínimo de 6 caracteres"
          >
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
            loading={savingPassword}
            disabled={newPassword.length < 6}
          >
            Definir nova senha
          </Button>
        </Card>
      </div>
    </div>
  );
}

function FinanceTab({
  defaultFeeId,
  defaultWodfulFeePercent,
  platformDefault,
  setDefaultWodfulFeePercent,
  onSave,
  saving,
}: {
  defaultFeeId: string;
  defaultWodfulFeePercent: string;
  platformDefault: number;
  setDefaultWodfulFeePercent: (value: string) => void;
  onSave: (event: FormEvent) => void;
  saving: boolean;
}) {
  return (
    <div className="max-w-xl">
      <Card
        as="form"
        title="Comissão padrão"
        description="Usada em novos eventos desta conta. Ajuste fino no detalhe de cada evento."
        onSubmit={onSave}
        className="space-y-4"
        padding="compact"
      >
        <FormField
          id={defaultFeeId}
          label="Comissão Wodful (%)"
          hint={`Vazio = padrão da plataforma (${platformDefault}%)`}
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
            placeholder={String(platformDefault)}
          />
        </FormField>
        <Button type="submit" loading={saving}>
          Salvar comissão
        </Button>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        tone === "warning"
          ? "border-amber-200/80 bg-amber-50/50"
          : "border-gray-200/80 bg-white",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-gray-900">
        {value}
      </p>
    </div>
  );
}

function MetricLink({
  label,
  value,
  href,
  showLink = true,
}: {
  label: string;
  value: string | number;
  href: string;
  showLink?: boolean;
}) {
  const classes = cn(
    "block rounded-xl border border-gray-200/80 bg-white p-4",
    showLink &&
      "transition-colors hover:border-primary/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  );

  const content = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-gray-900">
        {value}
      </p>
      {showLink ? (
        <p className="mt-1 text-xs font-medium text-primary">Ver lista →</p>
      ) : null}
    </>
  );

  if (showLink) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
