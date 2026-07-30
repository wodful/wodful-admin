"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContent } from "@/components/ui/page-content";
import { PageHeader } from "@/components/ui/page-header";
import { FormSkeleton, Skeleton } from "@/components/ui/skeleton";
import {
  PaymentStatusBadge,
  SubscriptionStatusBadge,
} from "@/components/ui/user-badges";
import {
  approveSubscription,
  createSubscriptionPaymentLink,
  declineSubscription,
  getSubscription,
  setSubscriptionComplimentary,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { SubscriptionDetail } from "@/lib/types";

export default function SubscriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["subscription", id],
    queryFn: () => getSubscription(id),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["subscription", id] });
    await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
  };

  const approveMutation = useMutation({
    mutationFn: () => approveSubscription(id),
    onSuccess: async () => {
      setMessage("Inscrição aprovada");
      setErrorMessage(null);
      await invalidate();
    },
    onError: (err) => {
      setMessage(null);
      setErrorMessage(err instanceof ApiError ? err.message : "Erro ao aprovar");
    },
  });

  const declineMutation = useMutation({
    mutationFn: () => declineSubscription(id),
    onSuccess: async () => {
      setMessage("Inscrição recusada");
      setErrorMessage(null);
      await invalidate();
    },
    onError: (err) => {
      setMessage(null);
      setErrorMessage(err instanceof ApiError ? err.message : "Erro ao recusar");
    },
  });

  const complimentaryMutation = useMutation({
    mutationFn: (isComplimentary: boolean) =>
      setSubscriptionComplimentary(id, isComplimentary),
    onSuccess: async () => {
      setMessage("Cortesia atualizada");
      setErrorMessage(null);
      await invalidate();
    },
    onError: (err) => {
      setMessage(null);
      setErrorMessage(
        err instanceof ApiError ? err.message : "Erro ao atualizar cortesia",
      );
    },
  });

  const paymentLinkMutation = useMutation({
    mutationFn: () => createSubscriptionPaymentLink(id),
    onSuccess: async (result) => {
      setPaymentLink(result.paymentUrl);
      setCopyDone(false);
      setMessage("Link de pagamento gerado");
      setErrorMessage(null);
      await invalidate();
    },
    onError: (err) => {
      setMessage(null);
      setErrorMessage(
        err instanceof ApiError ? err.message : "Erro ao gerar link",
      );
    },
  });

  async function copyPaymentLink() {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopyDone(true);
    } catch {
      setCopyDone(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-48" />
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
        {(error as Error)?.message ?? "Inscrição não encontrada"}
      </Alert>
    );
  }

  const busy =
    approveMutation.isPending ||
    declineMutation.isPending ||
    complimentaryMutation.isPending ||
    paymentLinkMutation.isPending;

  const isWaiting = data.status === "WAITING";
  const isApproved = data.status === "APPROVED";
  const isDeclined = data.status === "DECLINED";

  const canCreatePaymentLink =
    !data.isComplimentary && !data.paidOnline && (isWaiting || isDeclined);

  const unpaidApproved =
    isApproved && !data.paidOnline && !data.isComplimentary;

  const phoneDigits = data.responsiblePhone?.replace(/\D/g, "") ?? "";

  return (
    <PageContent>
      <PageHeader
        eyebrow="Inscrições"
        title={data.nickname}
        backHref="/subscriptions"
        badges={
          <>
            <SubscriptionStatusBadge status={data.status} />
            {data.isComplimentary ? (
              <Badge variant="primary">Cortesia</Badge>
            ) : null}
            {data.paidOnline ? (
              <Badge variant="success">Pago online</Badge>
            ) : null}
          </>
        }
        description={
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium text-gray-700">
              {data.responsibleName}
            </span>
            <span className="text-gray-300" aria-hidden>
              ·
            </span>
            <a
              href={`mailto:${data.responsibleEmail}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              {data.responsibleEmail}
            </a>
            {phoneDigits ? (
              <>
                <span className="text-gray-300" aria-hidden>
                  ·
                </span>
                <a
                  href={`tel:+${phoneDigits}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {data.responsiblePhone}
                </a>
              </>
            ) : null}
          </p>
        }
      />

      {message ? <Alert variant="success">{message}</Alert> : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      {unpaidApproved ? (
        <Card
          padding="compact"
          className="border-amber-200/80 bg-amber-50/50"
          role="status"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-medium text-gray-900">
                Aprovada sem pagamento online
              </p>
              <p className="text-sm text-gray-600">
                Estimado {formatMoney(data.amountEstimated)} · pago{" "}
                {formatMoney(data.amountPaid)}. Marque cortesia se for o caso.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                loading={complimentaryMutation.isPending}
                disabled={busy}
                onClick={() => complimentaryMutation.mutate(true)}
              >
                Marcar cortesia
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {isWaiting ? (
        <Card title="Decisão" padding="compact">
          <p className="mb-3 text-sm text-gray-500">
            Aprovar libera o atleta; recusar encerra a inscrição.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              loading={approveMutation.isPending}
              disabled={busy}
              onClick={() => approveMutation.mutate()}
            >
              Aprovar
            </Button>
            <Button
              variant="danger"
              loading={declineMutation.isPending}
              disabled={busy}
              onClick={() => declineMutation.mutate()}
            >
              Recusar
            </Button>
          </div>
        </Card>
      ) : null}

      {isDeclined ? (
        <Card padding="compact" className="border-gray-200 bg-gray-50/80">
          <p className="text-sm text-gray-600">
            Inscrição recusada ou pagamento expirado. Você pode gerar um novo
            link de pagamento (reativa a inscrição se houver vaga) ou aprovar
            novamente.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {canCreatePaymentLink ? (
              <Button
                loading={paymentLinkMutation.isPending}
                disabled={busy}
                onClick={() => paymentLinkMutation.mutate()}
              >
                Criar novo link
              </Button>
            ) : null}
            <Button
              loading={approveMutation.isPending}
              disabled={busy}
              onClick={() => approveMutation.mutate()}
            >
              Aprovar novamente
            </Button>
          </div>
        </Card>
      ) : null}

      <Card title="Financeiro" padding="compact">
        <dl className="mb-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500">Pago</dt>
            <dd className="text-base font-semibold tabular-nums text-gray-900">
              {formatMoney(data.amountPaid)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Estimado</dt>
            <dd className="text-base font-semibold tabular-nums text-gray-900">
              {formatMoney(data.amountEstimated)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Ingresso</dt>
            <dd className="font-medium text-gray-800">
              {data.ticket?.name ?? "—"} ·{" "}
              {formatMoney(data.ticket?.price ?? data.ticketPrice)}
            </dd>
          </div>
        </dl>

        {!unpaidApproved ? (
          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            {canCreatePaymentLink && isWaiting ? (
              <Button
                variant="secondary"
                loading={paymentLinkMutation.isPending}
                disabled={busy}
                onClick={() => paymentLinkMutation.mutate()}
              >
                Criar novo link
              </Button>
            ) : null}
            <Button
              variant="secondary"
              loading={complimentaryMutation.isPending}
              disabled={busy}
              onClick={() =>
                complimentaryMutation.mutate(!data.isComplimentary)
              }
            >
              {data.isComplimentary ? "Remover cortesia" : "Marcar cortesia"}
            </Button>
          </div>
        ) : null}

        {paymentLink ? (
          <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">
              Link de pagamento
            </p>
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all text-sm text-primary underline-offset-2 hover:underline"
            >
              {paymentLink}
            </a>
            <Button variant="secondary" onClick={copyPaymentLink}>
              {copyDone ? "Copiado" : "Copiar link"}
            </Button>
          </div>
        ) : null}

        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="mb-2 text-sm font-medium text-gray-900">
            Histórico de pagamentos
          </h3>
          <PaymentsList payments={data.payments} />
        </div>
      </Card>

      <Card title="Evento e participantes" padding="compact">
        <dl className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Evento</dt>
            <dd className="font-medium text-gray-900">
              {data.championship ? (
                <Link
                  href={`/events/${data.championship.id}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {data.championship.name}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Categoria</dt>
            <dd className="font-medium text-gray-800">
              {data.category?.name ?? data.ticket?.categoryName ?? "—"}
            </dd>
          </div>
        </dl>

        {data.participants.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum participante.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Participantes da inscrição</caption>
              <thead className="border-b border-gray-100 bg-gray-50 text-gray-500">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Nome
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Box
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Cidade
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Camisa
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.participants.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {p.name}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {p.affiliation || "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{p.city || "—"}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {p.tShirtSize || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContent>
  );
}

function PaymentsList({
  payments,
}: {
  payments: SubscriptionDetail["payments"];
}) {
  if (payments.length === 0) {
    return (
      <p className="text-sm text-gray-500">Nenhum pagamento registrado.</p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
      {payments.map((payment) => (
        <li
          key={payment.id}
          className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 text-sm"
        >
          <div>
            <Link
              href={`/payments/${payment.id}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {formatMoney(payment.amountFinal)}
            </Link>
            <p className="text-xs text-gray-500">
              {formatDateTime(payment.createdAt)} · {payment.provider}
            </p>
          </div>
          <PaymentStatusBadge status={payment.status} />
        </li>
      ))}
    </ul>
  );
}
