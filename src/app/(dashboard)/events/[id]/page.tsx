"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useId, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { FormSkeleton, Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/user-badges";
import {
  getChampionship,
  updateChampionshipFees,
} from "@/lib/admin-api";
import { SettlementReportCard } from "@/components/settlement-report-card";
import { ApiError } from "@/lib/api";
import { formatDate, formatMoney, siteEventUrl } from "@/lib/format";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const wodfulFeeId = useId();
  const mpFeeId = useId();
  const [wodfulFeePercent, setWodfulFeePercent] = useState("");
  const [mpFeePercentEstimate, setMpFeePercentEstimate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            ? data?.defaultWodfulFeePercent ?? 12
            : Number(wodfulFeePercent),
        mpFeePercentEstimate:
          mpFeePercentEstimate === "" ? null : Number(mpFeePercentEstimate),
      }),
    onSuccess: async () => {
      setMessage("Financeiro do evento atualizado");
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["championship", id] });
      await queryClient.invalidateQueries({ queryKey: ["championships"] });
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Eventos"
        title={data.name}
        description={`${data.accessCode} · ${formatDate(data.startDate)} – ${formatDate(data.endDate)}`}
        backHref="/events"
        actions={<StatusBadge isActive={data.isActive} />}
      />

      <div className="flex flex-wrap gap-3">
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Abrir página pública
        </a>
        {data.organizer ? (
          <Link
            href={`/users/${data.organizer.id}`}
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-gray-600 underline-offset-2 hover:underline"
          >
            Ver organizador
          </Link>
        ) : null}
      </div>

      {message ? <Alert variant="success">{message}</Alert> : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Aprovadas" value={summary.subscriptionsApproved} />
        <Metric label="Aguardando" value={summary.subscriptionsWaiting} />
        <Metric label="Receita paga" value={formatMoney(summary.revenuePaid)} />
        <Metric
          label="Ingressos"
          value={`${summary.ticketsSold}/${summary.ticketsCapacity}`}
        />
      </div>

      <Card
        as="form"
        title="Financeiro do evento"
        description="A comissão Wodful absorve o custo do Mercado Pago — o organizador paga só a comissão sobre o bruto."
        onSubmit={onSaveFees}
        className="space-y-5"
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
        <Button type="submit" loading={feesMutation.isPending}>
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

      <SettlementReportCard championshipId={id} />

      <Card title="Organizador">
        {data.organizer ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Nome</dt>
              <dd className="font-medium text-gray-900">{data.organizer.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">E-mail</dt>
              <dd className="text-gray-800">{data.organizer.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Username</dt>
              <dd className="text-gray-800">@{data.organizer.username}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd>
                <StatusBadge isActive={Boolean(data.organizer.isActive)} />
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-gray-500">Sem organizador vinculado.</p>
        )}
      </Card>

      <Card title="Categorias e ingressos">
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
                        <p className="font-medium text-gray-900">{ticket.name}</p>
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

      <Card title="Cupons">
        {data.coupons.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum cupom.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-2 py-2 font-medium">Código</th>
                  <th className="px-2 py-2 font-medium">Tipo</th>
                  <th className="px-2 py-2 font-medium">Valor</th>
                  <th className="px-2 py-2 font-medium">Resgates</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-100 last:border-0">
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

      <Card
        title="Resumo analítico"
        description="Métricas agregadas do evento."
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Atletas" value={summary.athletes} />
          <Stat label="Online" value={summary.subscriptionsOnline} />
          <Stat label="Cortesia" value={summary.subscriptionsComplimentary} />
          <Stat label="Receita estimada" value={formatMoney(summary.revenueEstimated)} />
          <Stat label="Descontos" value={formatMoney(summary.discountTotal)} />
          <Stat label="Cupons resgatados" value={summary.couponsRedeemed} />
        </dl>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padding="compact">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-gray-900">{value}</p>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
