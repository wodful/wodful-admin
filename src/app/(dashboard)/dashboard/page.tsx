"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconAlert, IconChevronRight } from "@/components/ui/icons";
import { PageContent } from "@/components/ui/page-content";
import { PageHeader } from "@/components/ui/page-header";
import { Section, StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboard, listChampionships } from "@/lib/admin-api";
import { formatDate, formatMoney } from "@/lib/format";
import type {
  AdminDashboard,
  ChampionshipListItem,
  DashboardAlert,
} from "@/lib/types";
import { cn } from "@/lib/cn";

const alertHref: Record<string, string> = {
  stale_pending_payments:
    "/payments?status=PENDING&isComplimentary=false&subscriptionStatus=WAITING",
  paid_without_approved: "/payments?status=PAID&isComplimentary=false",
  cancelled_still_waiting: "/subscriptions?status=WAITING",
  inactive_owner_active_event: "/events?isActive=true",
  sold_out_with_waiting: "/subscriptions?status=WAITING",
};

function eventNeedsAttention(event: ChampionshipListItem) {
  const waiting = event.counts.waiting;
  const pending = event.counts.pendingPayments ?? 0;
  const organizerIssue =
    event.organizer?.isActive === false ||
    event.organizer?.role === "NO_ACCESS";
  return {
    waiting,
    pending,
    organizerIssue,
    needsAttention: waiting > 0 || pending > 0 || organizerIssue,
  };
}

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const { data: activeEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["championships", { page: 1, perPage: 12, isActive: "true" }],
    queryFn: () =>
      listChampionships({ page: 1, perPage: 12, isActive: "true" }),
  });

  const sortedEvents = useMemo(() => {
    const events = activeEvents?.data ?? [];
    return [...events].sort((a, b) => {
      const scoreA = eventNeedsAttention(a);
      const scoreB = eventNeedsAttention(b);
      const points = (s: ReturnType<typeof eventNeedsAttention>) =>
        s.waiting * 2 + s.pending * 3 + (s.organizerIssue ? 10 : 0);
      return points(scoreB) - points(scoreA);
    });
  }, [activeEvents?.data]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error">
        {(error as Error)?.message ?? "Erro ao carregar dashboard"}
      </Alert>
    );
  }

  const isCalm = data.alerts.length === 0;
  const queuesIdle =
    isCalm &&
    data.kpis.subscriptionsWaiting === 0 &&
    data.kpis.paymentsPending === 0;
  const eventsWithAttention = sortedEvents.filter(
    (event) => eventNeedsAttention(event).needsAttention,
  ).length;

  return (
    <PageContent>
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description="O que está acontecendo agora e o que precisa da sua atenção."
      />

      <StatusPanel
        alerts={data.alerts}
        kpis={data.kpis}
        activeEventsCount={sortedEvents.length}
        eventsWithAttention={eventsWithAttention}
      />

      <Section
        title="Eventos ativos"
        description={
          isCalm
            ? "Competições no ar neste momento."
            : "Priorizados pelo que ainda precisa de ação."
        }
        action={
          <Link
            href="/events?isActive=true"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos
          </Link>
        }
      >
        {eventsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <ActiveEventsList events={sortedEvents} />
        )}
      </Section>

      {queuesIdle ? (
        <nav
          aria-label="Atalhos"
          className="flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-200/80 pt-4 text-sm"
        >
          <Link
            href="/events?isActive=true"
            className="font-medium text-gray-600 transition-colors hover:text-primary"
          >
            Eventos
          </Link>
          <Link
            href="/subscriptions?status=WAITING"
            className="font-medium text-gray-600 transition-colors hover:text-primary"
          >
            Inscrições
          </Link>
          <Link
            href="/payments?status=PENDING&isComplimentary=false&subscriptionStatus=WAITING"
            className="font-medium text-gray-600 transition-colors hover:text-primary"
          >
            Pagamentos
          </Link>
          <Link
            href="/users"
            className="font-medium text-gray-600 transition-colors hover:text-primary"
          >
            Contas
          </Link>
        </nav>
      ) : (
        <Section
          title="Filas"
          description="Atalhos para o que ainda precisa de ação."
        >
          <div className="grid gap-2 sm:grid-cols-3">
            <StatCard
              label="Eventos ativos"
              value={data.kpis.eventsActive}
              hint={`${data.kpis.eventsTotal} no total`}
              tone="accent"
              href="/events?isActive=true"
              className="sm:p-4"
            />
            <StatCard
              label="Inscrições aguardando"
              value={data.kpis.subscriptionsWaiting}
              tone={
                data.kpis.subscriptionsWaiting > 0 ? "warning" : "default"
              }
              href="/subscriptions?status=WAITING"
              className="sm:p-4"
            />
            <StatCard
              label="Pagamentos pendentes"
              value={data.kpis.paymentsPending}
              tone={data.kpis.paymentsPending > 0 ? "warning" : "default"}
              href="/payments?status=PENDING&isComplimentary=false&subscriptionStatus=WAITING"
              className="sm:p-4"
            />
          </div>
        </Section>
      )}
    </PageContent>
  );
}

function StatusPanel({
  alerts,
  kpis,
  activeEventsCount,
  eventsWithAttention,
}: {
  alerts: DashboardAlert[];
  kpis: AdminDashboard["kpis"];
  activeEventsCount: number;
  eventsWithAttention: number;
}) {
  if (alerts.length > 0) {
    return (
      <section aria-labelledby="dashboard-alerts-heading">
        <h2 id="dashboard-alerts-heading" className="sr-only">
          Precisa de atenção
        </h2>
        <Card
          title="Precisa de atenção"
          description={`${alerts.length} item${alerts.length > 1 ? "s" : ""} para revisar`}
          padding="compact"
          className="border-amber-200/70 bg-amber-50/40"
        >
          <ul className="divide-y divide-amber-100/80">
            {alerts.map((alert) => {
              const href = alertHref[alert.type] ?? "/dashboard";
              return (
                <li key={`${alert.type}-${alert.message}`}>
                  <Link
                    href={href}
                    className="flex min-h-[56px] items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="flex min-w-0 items-start gap-2.5 text-gray-800">
                      <span
                        className="mt-0.5 shrink-0 text-amber-700"
                        aria-hidden
                      >
                        <IconAlert />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">{alert.message}</span>
                        <span className="mt-0.5 block text-xs text-amber-900/80">
                          {alert.actionLabel} →
                        </span>
                      </span>
                    </span>
                    <span
                      className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 tabular-nums"
                      aria-label={`${alert.count} ocorrências`}
                    >
                      {alert.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>
    );
  }

  return (
    <Card
      padding="compact"
      className="border-emerald-200/70 bg-emerald-50/40"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">
              Operação em dia
            </h2>
            <Badge variant="success">Tudo certo</Badge>
          </div>
          <p className="text-sm text-gray-600">
            Sem filas críticas. Os eventos ativos estão sem pendências
            operacionais.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-center sm:text-right">
          <div>
            <dt className="text-xs text-gray-500">Ativos</dt>
            <dd className="text-lg font-semibold tabular-nums text-gray-900">
              {activeEventsCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Aguardando</dt>
            <dd className="text-lg font-semibold tabular-nums text-gray-900">
              {kpis.subscriptionsWaiting}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Pendentes</dt>
            <dd className="text-lg font-semibold tabular-nums text-gray-900">
              {kpis.paymentsPending}
            </dd>
          </div>
        </dl>
      </div>
      {eventsWithAttention > 0 ? (
        <p className="mt-3 border-t border-emerald-100 pt-3 text-xs text-amber-800">
          {eventsWithAttention} evento
          {eventsWithAttention > 1 ? "s" : ""} na lista ainda tem sinal de
          atenção (sem alerta global).
        </p>
      ) : null}
    </Card>
  );
}

function ActiveEventsList({ events }: { events: ChampionshipListItem[] }) {
  if (events.length === 0) {
    return (
      <Card padding="compact">
        <p className="font-medium text-gray-900">Nenhum evento ativo</p>
        <p className="mt-1 text-sm text-gray-500">
          Quando um campeonato estiver público, ele aparece aqui para
          acompanhamento.
        </p>
        <Link
          href="/events"
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Ver todos os eventos
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" padding="flush">
      <ul className="divide-y divide-gray-100">
        {events.map((event) => {
          const { waiting, pending, organizerIssue, needsAttention } =
            eventNeedsAttention(event);

          return (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                className={cn(
                  "flex min-h-[72px] flex-col gap-3 px-4 py-4 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between sm:px-5",
                  needsAttention && "bg-amber-50/30",
                )}
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-gray-900">
                      {event.name}
                    </p>
                    {needsAttention ? (
                      <Badge variant="warning">Atenção</Badge>
                    ) : (
                      <Badge variant="success">Em dia</Badge>
                    )}
                  </div>

                  <dl className="grid gap-1 text-sm text-gray-600 sm:grid-cols-2">
                    <div className="flex gap-1.5">
                      <dt className="text-gray-400">Código</dt>
                      <dd className="font-medium text-gray-700">
                        {event.accessCode}
                      </dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-gray-400">Organizador</dt>
                      <dd className="truncate font-medium text-gray-700">
                        {event.organizer?.name ?? "—"}
                      </dd>
                    </div>
                    <div className="flex gap-1.5 sm:col-span-2">
                      <dt className="text-gray-400">Período</dt>
                      <dd>
                        {formatDate(event.startDate)} –{" "}
                        {formatDate(event.endDate)}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span className="tabular-nums">
                      {event.counts.approved}/{event.counts.total} aprovadas
                    </span>
                    {waiting > 0 ? (
                      <span className="tabular-nums font-medium text-amber-800">
                        {waiting} aguardando
                      </span>
                    ) : (
                      <span className="text-gray-500">Fila zerada</span>
                    )}
                    {pending > 0 ? (
                      <span className="tabular-nums font-medium text-amber-800">
                        {pending} pag. pendentes
                      </span>
                    ) : null}
                    {organizerIssue ? (
                      <span className="font-medium text-red-700">
                        Organizador sem acesso
                      </span>
                    ) : null}
                    {event.counts.billableGross > 0 ? (
                      <span className="tabular-nums text-gray-500">
                        {formatMoney(event.counts.billableGross)} faturado
                      </span>
                    ) : null}
                  </div>
                </div>

                <span className="flex shrink-0 items-center gap-1.5 self-end text-sm font-medium text-primary sm:self-center">
                  Abrir evento
                  <IconChevronRight className="text-gray-400" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
