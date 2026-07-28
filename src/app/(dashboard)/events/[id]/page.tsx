"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Suspense, useEffect, useId, useState } from "react";

import { EventNav, isEventTabId, type EventTabId } from "@/components/event-nav";
import { SettlementReportCard } from "@/components/settlement-report-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageContent } from "@/components/ui/page-content";
import { PageHeader } from "@/components/ui/page-header";
import { FormSkeleton, Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/user-badges";
import {
  exportChampionshipAthletes,
  exportChampionshipContacts,
  getChampionship,
  updateChampionshipFees,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { formatDate, formatMoney, siteEventUrl } from "@/lib/format";
import type { ChampionshipDetail } from "@/lib/types";
import { cn } from "@/lib/cn";

export default function EventDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      }
    >
      <EventDetailPageContent />
    </Suspense>
  );
}

function EventDetailPageContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const rawTab = searchParams.get("tab");
  const tab: EventTabId = isEventTabId(rawTab) ? rawTab : "overview";

  const queryClient = useQueryClient();
  const wodfulFeeId = useId();
  const mpFeeId = useId();
  const [wodfulFeePercent, setWodfulFeePercent] = useState("");
  const [mpFeePercentEstimate, setMpFeePercentEstimate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["championship", id],
    queryFn: () => getChampionship(id),
  });

  useEffect(() => {
    if (!data) return;
    setWodfulFeePercent(String(data.wodfulFeePercent));
    setMpFeePercentEstimate(
      data.mpFeePercentEstimate == null
        ? ""
        : String(data.mpFeePercentEstimate),
    );
  }, [data]);

  const feesMutation = useMutation({
    mutationFn: () =>
      updateChampionshipFees(id, {
        wodfulFeePercent:
          wodfulFeePercent === ""
            ? (data?.defaultWodfulFeePercent ?? 12)
            : Number(wodfulFeePercent),
        mpFeePercentEstimate:
          mpFeePercentEstimate === "" ? null : Number(mpFeePercentEstimate),
      }),
    onSuccess: async () => {
      setMessage("Financeiro do evento atualizado");
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["championship", id] });
      await queryClient.invalidateQueries({ queryKey: ["championships"] });
      await queryClient.invalidateQueries({
        queryKey: ["championship-settlement", id],
      });
    },
    onError: (err) => {
      setMessage(null);
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : "Erro ao atualizar financeiro",
      );
    },
  });

  const athletesExport = useMutation({
    mutationFn: () => exportChampionshipAthletes(id),
    onSuccess: () => {
      setExportError(null);
      setExportMessage("Relatório de atletas exportado");
    },
    onError: (err) => {
      setExportMessage(null);
      setExportError(
        err instanceof ApiError ? err.message : "Falha ao exportar atletas",
      );
    },
  });

  const contactsExport = useMutation({
    mutationFn: () => exportChampionshipContacts(id),
    onSuccess: () => {
      setExportError(null);
      setExportMessage("Relatório de contatos exportado");
    },
    onError: (err) => {
      setExportMessage(null);
      setExportError(
        err instanceof ApiError ? err.message : "Falha ao exportar contatos",
      );
    },
  });

  function onSaveFees(event: FormEvent) {
    event.preventDefault();
    feesMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Card>
          <FormSkeleton />
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error">
        {(error as Error)?.message ?? "Evento não encontrado"}
      </Alert>
    );
  }

  const summary = data.analytics.summary;
  const publicUrl = siteEventUrl(data.accessCode);

  return (
    <PageContent>
      <PageHeader
        eyebrow="Eventos"
        title={data.name}
        description={
          <div className="space-y-1">
            <p>
              {data.accessCode} · {formatDate(data.startDate)} –{" "}
              {formatDate(data.endDate)}
            </p>
            {!data.isActive ? (
              <p className="text-amber-800">
                Evento privado — não aparece na listagem pública.
              </p>
            ) : null}
          </div>
        }
        backHref="/events"
        badges={<StatusBadge isActive={data.isActive} />}
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              loading={athletesExport.isPending}
              disabled={contactsExport.isPending}
              onClick={() => athletesExport.mutate()}
            >
              Exportar atletas
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={contactsExport.isPending}
              disabled={athletesExport.isPending}
              onClick={() => contactsExport.mutate()}
            >
              Exportar contatos
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Abrir página pública
        </a>
        {data.organizer ? (
          <span className="text-gray-600">
            Organizador:{" "}
            <Link
              href={`/users/${data.organizer.id}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {data.organizer.name}
            </Link>
            {!data.organizer.isActive ? (
              <span className="ml-1.5 text-amber-800">(inativo)</span>
            ) : null}
          </span>
        ) : (
          <span className="text-gray-500">Sem organizador</span>
        )}
      </div>

      <EventNav eventId={id} />

      {exportMessage ? <Alert variant="success">{exportMessage}</Alert> : null}
      {exportError ? <Alert variant="error">{exportError}</Alert> : null}
      {message && tab === "finance" ? (
        <Alert variant="success">{message}</Alert>
      ) : null}
      {errorMessage && tab === "finance" ? (
        <Alert variant="error">{errorMessage}</Alert>
      ) : null}

      {tab === "overview" ? (
        <OverviewTab eventId={id} summary={summary} />
      ) : null}

      {tab === "finance" ? (
        <FinanceTab
          data={data}
          eventId={id}
          wodfulFeeId={wodfulFeeId}
          mpFeeId={mpFeeId}
          wodfulFeePercent={wodfulFeePercent}
          mpFeePercentEstimate={mpFeePercentEstimate}
          setWodfulFeePercent={setWodfulFeePercent}
          setMpFeePercentEstimate={setMpFeePercentEstimate}
          onSaveFees={onSaveFees}
          saving={feesMutation.isPending}
        />
      ) : null}

      {tab === "tickets" ? <TicketsTab data={data} eventId={id} /> : null}

      {tab === "coupons" ? <CouponsTab data={data} /> : null}
    </PageContent>
  );
}

function OverviewTab({
  eventId,
  summary,
}: {
  eventId: string;
  summary: ChampionshipDetail["analytics"]["summary"];
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <MetricLink
          label="Aprovadas"
          value={summary.subscriptionsApproved}
          href={`/subscriptions?championshipId=${eventId}&status=APPROVED`}
          showLink={summary.subscriptionsApproved > 0}
        />
        <MetricLink
          label="Aguardando"
          value={summary.subscriptionsWaiting}
          href={`/subscriptions?championshipId=${eventId}&status=WAITING`}
          tone={summary.subscriptionsWaiting > 0 ? "warning" : "default"}
          showLink={summary.subscriptionsWaiting > 0}
        />
        <Metric
          label="Receita paga"
          value={formatMoney(summary.revenuePaid)}
        />
        <Metric
          label="Ingressos"
          value={`${summary.ticketsSold}/${summary.ticketsCapacity}`}
        />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-200/80 pt-4 text-sm">
        <Link
          href={`/subscriptions?championshipId=${eventId}`}
          className="font-medium text-primary transition-colors hover:underline"
        >
          Todas as inscrições do evento
        </Link>
      </div>

      {summary.subscriptionsComplimentary > 0 ||
      summary.discountTotal > 0 ||
      summary.couponsRedeemed > 0 ? (
        <dl className="grid gap-3 rounded-xl border border-gray-200/80 bg-white p-4 text-sm sm:grid-cols-3">
          {summary.subscriptionsComplimentary > 0 ? (
            <Stat
              label="Cortesia"
              value={summary.subscriptionsComplimentary}
            />
          ) : null}
          {summary.discountTotal > 0 ? (
            <Stat
              label="Descontos"
              value={formatMoney(summary.discountTotal)}
            />
          ) : null}
          {summary.couponsRedeemed > 0 ? (
            <Stat label="Cupons resgatados" value={summary.couponsRedeemed} />
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}

function FinanceTab({
  data,
  eventId,
  wodfulFeeId,
  mpFeeId,
  wodfulFeePercent,
  mpFeePercentEstimate,
  setWodfulFeePercent,
  setMpFeePercentEstimate,
  onSaveFees,
  saving,
}: {
  data: ChampionshipDetail;
  eventId: string;
  wodfulFeeId: string;
  mpFeeId: string;
  wodfulFeePercent: string;
  mpFeePercentEstimate: string;
  setWodfulFeePercent: (value: string) => void;
  setMpFeePercentEstimate: (value: string) => void;
  onSaveFees: (event: FormEvent) => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card
        as="form"
        title="Comissão e custos"
        description="A comissão Wodful absorve o custo do Mercado Pago — o organizador paga só a comissão sobre o bruto."
        onSubmit={onSaveFees}
        className="space-y-5"
        padding="compact"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id={wodfulFeeId}
            label="Comissão Wodful (%)"
            hint={`Deixe vazio para usar o padrão de ${data.defaultWodfulFeePercent}%`}
          >
            <Input
              id={wodfulFeeId}
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={wodfulFeePercent}
              onChange={(event) => setWodfulFeePercent(event.target.value)}
              placeholder="Padrão da plataforma"
            />
          </FormField>
          <FormField
            id={mpFeeId}
            label="Custo MP estimado (%)"
            hint={`Absorvido na comissão (não cobrado à parte). Vazio = ${data.defaultMpFeePercent}%. PIX ~0,99% · crédito ~4,98%`}
          >
            <Input
              id={mpFeeId}
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={mpFeePercentEstimate}
              onChange={(event) => setMpFeePercentEstimate(event.target.value)}
              placeholder={String(data.defaultMpFeePercent)}
            />
          </FormField>
        </div>
        <Button type="submit" loading={saving}>
          Salvar financeiro
        </Button>

        <dl className="grid gap-3 border-t border-gray-100 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            label="Volume online (MP)"
            value={formatMoney(data.finance.onlineGross)}
          />
          <Stat
            label="Volume manual"
            value={formatMoney(data.finance.manualGross)}
          />
          <Stat
            label="Base comissionável"
            value={formatMoney(data.finance.billableGross)}
          />
          <Stat
            label={`Comissão Wodful (${data.finance.wodfulFeePercent}%)`}
            value={formatMoney(data.finance.wodfulFeeAmount)}
          />
          <Stat
            label={`Custo MP estimado (${data.finance.mpFeePercent}%)`}
            value={formatMoney(data.finance.mpFeeAmount)}
          />
          <Stat
            label="Margem líquida Wodful"
            value={formatMoney(data.finance.wodfulNetMarginEstimate)}
          />
          <Stat
            label="Líquido do organizador"
            value={formatMoney(data.finance.organizerNetEstimate)}
          />
        </dl>
      </Card>

      <SettlementReportCard championshipId={eventId} />
    </div>
  );
}

function TicketsTab({
  data,
  eventId,
}: {
  data: ChampionshipDetail;
  eventId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          Categorias e lotes configurados neste evento.
        </p>
        <Link
          href={`/subscriptions?championshipId=${eventId}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver inscrições do evento
        </Link>
      </div>

      <Card title="Categorias e ingressos" padding="compact">
        <div className="space-y-5">
          {data.categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {category.name}
                </h3>
                {category.isTeam ? (
                  <Badge variant="muted">Time · {category.members}</Badge>
                ) : null}
              </div>
              {category.tickets.length === 0 ? (
                <p className="text-sm text-gray-500">Sem ingressos.</p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                  {category.tickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {ticket.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ticket.subscriptionsCount}/{ticket.quantity} ·{" "}
                          {ticket.enabled ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                      <p className="font-medium text-gray-800">
                        {formatMoney(ticket.price)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {data.categories.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma categoria.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function CouponsTab({ data }: { data: ChampionshipDetail }) {
  return (
    <Card title="Cupons" padding="compact">
      {data.coupons.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum cupom neste evento.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Cupons do evento</caption>
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th scope="col" className="px-2 py-2 font-medium">
                  Código
                </th>
                <th scope="col" className="px-2 py-2 font-medium">
                  Tipo
                </th>
                <th scope="col" className="px-2 py-2 font-medium">
                  Valor
                </th>
                <th scope="col" className="px-2 py-2 font-medium">
                  Resgates
                </th>
                <th scope="col" className="px-2 py-2 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-2 py-2 font-medium">{coupon.code}</td>
                  <td className="px-2 py-2">{coupon.type}</td>
                  <td className="px-2 py-2">
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.value}%`
                      : formatMoney(coupon.value)}
                  </td>
                  <td className="px-2 py-2">
                    {coupon.redemptions}
                    {coupon.maxRedemptions != null
                      ? `/${coupon.maxRedemptions}`
                      : ""}
                  </td>
                  <td className="px-2 py-2">
                    <StatusBadge isActive={coupon.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
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

function MetricLink({
  label,
  value,
  href,
  tone = "default",
  showLink = true,
}: {
  label: string;
  value: string | number;
  href: string;
  tone?: "default" | "warning";
  showLink?: boolean;
}) {
  const classes = cn(
    "block rounded-xl border p-4 sm:p-4",
    tone === "warning"
      ? "border-amber-200/80 bg-amber-50/50"
      : "border-gray-200/80 bg-white",
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
