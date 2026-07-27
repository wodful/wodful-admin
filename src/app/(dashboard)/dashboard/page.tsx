"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { IconAlert, IconChevronRight } from "@/components/ui/icons";
import { PageContent } from "@/components/ui/page-content";
import { PageHeader } from "@/components/ui/page-header";
import { Section, StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/user-badges";
import { getDashboard, listChampionships } from "@/lib/admin-api";
import { formatDate } from "@/lib/format";
import type {
  ChampionshipListItem,
  DashboardAlert,
  DashboardSeriesPoint,
} from "@/lib/types";

const alertHref: Record<string, string> = {
  stale_pending_payments:
    "/payments?status=PENDING&isComplimentary=false&subscriptionStatus=WAITING",
  paid_without_approved: "/payments?status=PAID&isComplimentary=false",
  cancelled_still_waiting: "/subscriptions?status=WAITING",
  inactive_owner_active_event: "/events?isActive=true",
  sold_out_with_waiting: "/subscriptions?status=WAITING",
};

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const { data: activeEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["championships", { page: 1, perPage: 8, isActive: "true" }],
    queryFn: () => listChampionships({ page: 1, perPage: 8, isActive: "true" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-8 w-20" />
            </div>
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

  const { kpis, series, alerts } = data;

  return (
    <PageContent>
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description="Eventos ativos, o que precisa de atenção e atividade recente."
      />

      <AlertsBlock alerts={alerts} />

      <Section
        title="Eventos agora"
        description="Pulso operacional da plataforma."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Eventos ativos"
            value={kpis.eventsActive}
            hint={`${kpis.eventsTotal} no total`}
            tone="accent"
            href="/events?isActive=true"
          />
          <StatCard
            label="Organizadores ativos"
            value={kpis.organizersActive}
            hint={`${kpis.organizersTotal} contas`}
            href="/users"
          />
          <StatCard
            label="Inscrições aguardando"
            value={kpis.subscriptionsWaiting}
            tone={kpis.subscriptionsWaiting > 0 ? "warning" : "default"}
            href="/subscriptions?status=WAITING"
          />
          <StatCard
            label="Pagamentos pendentes"
            value={kpis.paymentsPending}
            tone={kpis.paymentsPending > 0 ? "warning" : "default"}
            href="/payments?status=PENDING&isComplimentary=false&subscriptionStatus=WAITING"
          />
        </div>
      </Section>

      <Section
        title="Eventos ativos"
        description="Abra o detalhe para financeiro, categorias e suporte."
      >
        {eventsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <ActiveEventsList events={activeEvents?.data ?? []} />
        )}
      </Section>

      <Section title="Atividade recente">
        <div className="grid gap-4 lg:grid-cols-2">
          <SeriesCard
            title="Novos eventos"
            subtitle="Últimos 7 dias"
            points={series.newEvents7d}
            href="/events"
          />
          <SeriesCard
            title="Novas inscrições"
            subtitle="Últimos 7 dias"
            points={series.newSubscriptions7d}
            href="/subscriptions"
          />
        </div>
      </Section>
    </PageContent>
  );
}

function ActiveEventsList({ events }: { events: ChampionshipListItem[] }) {
  if (events.length === 0) {
    return (
      <Card padding="compact">
        <p className="text-sm text-gray-500">Nenhum evento ativo no momento.</p>
        <Link
          href="/events"
          className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Ver todos os eventos
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" padding="flush">
      <ul className="divide-y divide-gray-100">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              href={`/events/${event.id}`}
              className="flex min-h-[56px] flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{event.name}</p>
                <p className="text-xs text-gray-500">
                  {event.accessCode}
                  {event.organizer ? ` · ${event.organizer.name}` : ""}
                  {" · "}
                  {formatDate(event.startDate)} – {formatDate(event.endDate)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <span className="tabular-nums text-gray-600">
                  {event.counts.approved}/{event.counts.total} insc.
                </span>
                <StatusBadge isActive={event.isActive} />
                <IconChevronRight className="text-gray-400" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
        <Link
          href="/events?isActive=true"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver todos os ativos
        </Link>
      </div>
    </Card>
  );
}

function AlertsBlock({ alerts }: { alerts: DashboardAlert[] }) {
  if (alerts.length === 0) {
    return (
      <Alert variant="success">
        Nenhum alerta operacional no momento.
      </Alert>
    );
  }

  return (
    <Card
      title="Precisa de atenção"
      description={`${alerts.length} item${alerts.length > 1 ? "s" : ""} para revisar.`}
      padding="compact"
      className="border-amber-200/70 bg-amber-50/30"
    >
      <ul className="divide-y divide-amber-100/80">
        {alerts.map((alert) => {
          const href = alertHref[alert.type] ?? "/dashboard";
          return (
            <li key={`${alert.type}-${alert.message}`}>
              <Link
                href={href}
                className="flex min-h-[52px] items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-primary"
              >
                <span className="flex items-start gap-2.5 text-gray-800">
                  <span className="mt-0.5 shrink-0 text-amber-700" aria-hidden>
                    <IconAlert />
                  </span>
                  {alert.message}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 tabular-nums">
                    {alert.count}
                  </span>
                  <IconChevronRight className="text-gray-400" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function SeriesCard({
  title,
  subtitle,
  points,
  href,
}: {
  title: string;
  subtitle: string;
  points: DashboardSeriesPoint[];
  href: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.count));
  const total = points.reduce((sum, p) => sum + p.count, 0);

  return (
    <Card padding="compact">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold tabular-nums text-gray-900">
            {total}
          </p>
          <Link
            href={href}
            className="text-xs font-medium text-primary hover:underline"
          >
            Ver todos
          </Link>
        </div>
      </div>

      {points.length === 0 ? (
        <p className="text-sm text-gray-500">Sem dados no período.</p>
      ) : (
        <ul className="space-y-2.5" aria-label={title}>
          {points.map((point) => (
            <li key={point.date} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {new Date(`${point.date}T12:00:00`).toLocaleDateString(
                    "pt-BR",
                    { weekday: "short", day: "2-digit", month: "short" },
                  )}
                </span>
                <span className="font-medium tabular-nums text-gray-800">
                  {point.count}
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-gray-100"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-primary/75 transition-[width]"
                  style={{
                    width: `${Math.max(point.count > 0 ? 6 : 0, (point.count / max) * 100)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
