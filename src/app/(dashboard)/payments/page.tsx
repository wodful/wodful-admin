"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useMemo, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { PaymentStatusBadge } from "@/components/ui/user-badges";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { exportPayments, listPayments } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { PaymentStatus } from "@/lib/types";

const SEARCH_MIN_CHARS = 3;

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <PageHeader eyebrow="Financeiro" title="Pagamentos" />
        </div>
      }
    >
      <PaymentsPageContent />
    </Suspense>
  );
}

function PaymentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchId = useId();
  const statusId = useId();
  const complimentaryId = useId();
  const subscriptionStatusId = useId();
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "">(
    (searchParams.get("status") as PaymentStatus | null) ?? "",
  );
  const [isComplimentary, setIsComplimentary] = useState(
    searchParams.get("isComplimentary") ?? "",
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    searchParams.get("subscriptionStatus") ?? "",
  );
  const [page, setPage] = useState(1);
  const [exportError, setExportError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const search =
    debouncedSearch.length >= SEARCH_MIN_CHARS ? debouncedSearch : "";

  useEffect(() => {
    setPage(1);
  }, [search, status, isComplimentary, subscriptionStatus]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (isComplimentary === "true" || isComplimentary === "false") {
      params.set("isComplimentary", isComplimentary);
    }
    if (subscriptionStatus) {
      params.set("subscriptionStatus", subscriptionStatus);
    }
    const qs = params.toString();
    router.replace(qs ? `/payments?${qs}` : "/payments", { scroll: false });
  }, [status, isComplimentary, subscriptionStatus, router]);

  const filters = useMemo(
    () => ({
      page,
      perPage: 20,
      search,
      status,
      isComplimentary,
      subscriptionStatus,
    }),
    [page, search, status, isComplimentary, subscriptionStatus],
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["payments", filters],
    queryFn: () => listPayments(filters),
  });

  const exportMutation = useMutation({
    mutationFn: () => exportPayments({ status }),
    onSuccess: () => setExportError(null),
    onError: (err) => {
      setExportError(
        err instanceof ApiError ? err.message : "Erro ao exportar CSV",
      );
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;
  const showSkeleton = isLoading || (isFetching && !data);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Pagamentos"
        description="Acompanhe cobranças e exporte o extrato em CSV."
        actions={
          <Button
            variant="secondary"
            loading={exportMutation.isPending}
            onClick={() => exportMutation.mutate()}
          >
            Exportar CSV
          </Button>
        }
      />

      {exportError ? <Alert variant="error">{exportError}</Alert> : null}

      <Card padding="compact">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <FormField
            id={searchId}
            label="Busca"
            className="sm:col-span-2"
            hint="Digite ao menos 3 caracteres"
          >
            <Input
              id={searchId}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="E-mail, apelido ou ID do provedor"
              autoComplete="off"
            />
          </FormField>

          <FormField id={statusId} label="Status">
            <Select
              id={statusId}
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentStatus | "")}
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="EXPIRED">Expirado</option>
            </Select>
          </FormField>

          <FormField id={subscriptionStatusId} label="Inscrição">
            <Select
              id={subscriptionStatusId}
              value={subscriptionStatus}
              onChange={(e) => setSubscriptionStatus(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="WAITING">Aguardando</option>
              <option value="APPROVED">Aprovada</option>
              <option value="DECLINED">Recusada</option>
            </Select>
          </FormField>

          <FormField id={complimentaryId} label="Cortesia">
            <Select
              id={complimentaryId}
              value={isComplimentary}
              onChange={(e) => setIsComplimentary(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="false">Sem cortesia</option>
              <option value="true">Só cortesia</option>
            </Select>
          </FormField>
        </div>
      </Card>

      <Card className="overflow-hidden" padding="flush">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Lista de pagamentos</caption>
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Pagamento
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Evento
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Valor
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Criado em
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody aria-busy={showSkeleton || undefined}>
              {showSkeleton ? <TableSkeleton rows={6} columns={6} /> : null}
              {isError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-red-600">
                    {(error as Error)?.message ?? "Erro ao carregar pagamentos"}
                  </td>
                </tr>
              ) : null}
              {!showSkeleton && !isError
                ? data?.data.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-100 transition-colors last:border-0 hover:bg-primary/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {payment.subscription?.nickname ?? payment.ticketName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.subscription?.responsibleEmail ??
                            payment.provider}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {payment.championship?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatMoney(payment.amountFinal)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateTime(payment.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/payments/${payment.id}`}
                          className="inline-flex min-h-[44px] cursor-pointer items-center text-sm font-medium text-primary underline-offset-2 hover:underline"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                : null}
              {data && data.data.length === 0 && !showSkeleton && !isError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    Nenhum pagamento encontrado
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {data && data.total > data.perPage ? (
        <nav
          className="flex flex-wrap items-center justify-between gap-3 text-sm"
          aria-label="Paginação"
        >
          <span className="text-gray-500">
            {data.total} pagamento(s) · página {data.page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
