"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  const canCreatePaymentLink =
    !data.isComplimentary &&
    !data.paidOnline &&
    (data.status === "WAITING" || data.status === "APPROVED");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inscrições"
        title={data.nickname}
        description={data.responsibleName}
        backHref="/subscriptions"
        actions={<SubscriptionStatusBadge status={data.status} />}
      />

      {message ? <Alert variant="success">{message}</Alert> : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      <Card title="Ações">
        <div className="flex flex-wrap gap-2">
          <Button
            loading={approveMutation.isPending}
            disabled={busy || data.status === "APPROVED"}
            onClick={() => approveMutation.mutate()}
          >
            Aprovar
          </Button>
          <Button
            variant="danger"
            loading={declineMutation.isPending}
            disabled={busy || data.status === "DECLINED"}
            onClick={() => declineMutation.mutate()}
          >
            Recusar
          </Button>
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
          <Button
            variant="secondary"
            loading={paymentLinkMutation.isPending}
            disabled={busy || !canCreatePaymentLink}
            onClick={() => paymentLinkMutation.mutate()}
          >
            Criar novo link
          </Button>
        </div>

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
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Responsável">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Nome</dt>
              <dd className="font-medium text-gray-900">{data.responsibleName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">E-mail</dt>
              <dd className="text-gray-800">{data.responsibleEmail}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Telefone</dt>
              <dd className="text-gray-800">{data.responsiblePhone || "—"}</dd>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.isComplimentary ? (
                <Badge variant="primary">Cortesia</Badge>
              ) : null}
              {data.paidOnline ? (
                <Badge variant="success">Pago online</Badge>
              ) : null}
            </div>
          </dl>
        </Card>

        <Card title="Evento e ingresso">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Evento</dt>
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
              <dt className="text-gray-500">Categoria</dt>
              <dd className="text-gray-800">{data.category.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Ingresso</dt>
              <dd className="text-gray-800">
                {data.ticket?.name ?? "—"} ·{" "}
                {formatMoney(data.ticket?.price ?? data.ticketPrice)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Valores</dt>
              <dd className="text-gray-800">
                Pago: {formatMoney(data.amountPaid)} · Estimado:{" "}
                {formatMoney(data.amountEstimated)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card title="Participantes">
        {data.participants.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum participante.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-2 py-2 font-medium">Nome</th>
                  <th className="px-2 py-2 font-medium">Box</th>
                  <th className="px-2 py-2 font-medium">Cidade</th>
                  <th className="px-2 py-2 font-medium">Camisa</th>
                </tr>
              </thead>
              <tbody>
                {data.participants.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-2 py-2 font-medium">{p.name}</td>
                    <td className="px-2 py-2">{p.affiliation || "—"}</td>
                    <td className="px-2 py-2">{p.city || "—"}</td>
                    <td className="px-2 py-2">{p.tShirtSize || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Pagamentos">
        {data.payments.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum pagamento.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.payments.map((payment) => (
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
                    {formatDateTime(payment.createdAt)} · {payment.provider}
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
