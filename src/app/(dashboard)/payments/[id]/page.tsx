"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { FormSkeleton, Skeleton } from "@/components/ui/skeleton";
import {
  PaymentStatusBadge,
  SubscriptionStatusBadge,
} from "@/components/ui/user-badges";
import { getPayment } from "@/lib/admin-api";
import { formatDateTime, formatMoney } from "@/lib/format";

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPayment(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-40" />
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
        {(error as Error)?.message ?? "Pagamento não encontrado"}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pagamentos"
        title={formatMoney(data.amountFinal)}
        description={`${data.provider} · ${formatDateTime(data.createdAt)}`}
        backHref="/payments"
        actions={<PaymentStatusBadge status={data.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Detalhes">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Valor original</dt>
              <dd className="font-medium text-gray-900">
                {formatMoney(data.amountOriginal)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Valor final</dt>
              <dd className="font-medium text-gray-900">
                {formatMoney(data.amountFinal)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Preference ID</dt>
              <dd className="break-all text-gray-800">
                {data.providerPreferenceId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Payment ID</dt>
              <dd className="break-all text-gray-800">
                {data.providerPaymentId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">E-mail de aprovação</dt>
              <dd className="text-gray-800">
                {data.approvedEmailSentAt
                  ? formatDateTime(data.approvedEmailSentAt)
                  : "Não enviado"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Inscrição">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Apelido</dt>
              <dd className="font-medium text-gray-900">
                <Link
                  href={`/subscriptions/${data.subscription.id}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {data.subscription.nickname}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Responsável</dt>
              <dd className="text-gray-800">
                {data.subscription.responsibleName}
                <br />
                {data.subscription.responsibleEmail}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd>
                <SubscriptionStatusBadge status={data.subscription.status} />
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Ingresso</dt>
              <dd className="text-gray-800">
                {data.ticket.name} · {formatMoney(data.ticket.price)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card title="Evento">
        {data.championship ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Nome</dt>
              <dd className="font-medium text-gray-900">
                <Link
                  href={`/events/${data.championship.id}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {data.championship.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Código</dt>
              <dd className="text-gray-800">{data.championship.accessCode}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Organizador</dt>
              <dd className="text-gray-800">
                {data.championship.organizer?.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Cupom</dt>
              <dd className="text-gray-800">
                {data.coupon
                  ? `${data.coupon.code} (${data.coupon.type})`
                  : "—"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-gray-500">Sem evento vinculado.</p>
        )}
      </Card>
    </div>
  );
}
