"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { SubscriptionStatusBadge } from "@/components/ui/user-badges";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { listSubscriptions } from "@/lib/admin-api";
import { formatDateTime, formatMoney } from "@/lib/format";
import type {
  SubscriptionPaymentOrigin,
  SubscriptionStatus,
} from "@/lib/types";

const SEARCH_MIN_CHARS = 3;

const originLabel: Record<SubscriptionPaymentOrigin, string> = {
  MERCADO_PAGO: "Mercado Pago",
  MANUAL: "Manual",
  COMPLIMENTARY: "Cortesia",
  NONE: "Nenhum",
};

export default function SubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <PageHeader eyebrow="Operação" title="Inscrições" />
        </div>
      }
    >
      <SubscriptionsPageContent />
    </Suspense>
  );
}

function SubscriptionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchId = useId();
  const statusId = useId();
  const originId = useId();
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | "">(
    (searchParams.get("status") as SubscriptionStatus | null) ?? "",
  );
  const [paymentOrigin, setPaymentOrigin] = useState<
    SubscriptionPaymentOrigin | ""
  >("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const search =
    debouncedSearch.length >= SEARCH_MIN_CHARS ? debouncedSearch : "";

  useEffect(() => {
    setPage(1);
  }, [search, status, paymentOrigin]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const qs = params.toString();
    router.replace(qs ? `/subscriptions?${qs}` : "/subscriptions", {
      scroll: false,
    });
  }, [status, router]);

  const filters = useMemo(
    () => ({ page, perPage: 20, search, status, paymentOrigin }),
    [page, search, status, paymentOrigin],
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["subscriptions", filters],
    queryFn: () => listSubscriptions(filters),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;
  const showSkeleton = isLoading || (isFetching && !data);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Inscrições"
        description="Filtre, revise e gerencie inscrições da plataforma."
      />

      <Card padding="compact">
        <div className="grid gap-4 sm:grid-cols-4">
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
              placeholder="Apelido, responsável ou e-mail"
              autoComplete="off"
            />
          </FormField>

          <FormField id={statusId} label="Status">
            <Select
              id={statusId}
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as SubscriptionStatus | "")
              }
            >
              <option value="">Todos</option>
              <option value="WAITING">Aguardando</option>
              <option value="APPROVED">Aprovada</option>
              <option value="DECLINED">Recusada</option>
            </Select>
          </FormField>

          <FormField id={originId} label="Origem">
            <Select
              id={originId}
              value={paymentOrigin}
              onChange={(e) =>
                setPaymentOrigin(
                  e.target.value as SubscriptionPaymentOrigin | "",
                )
              }
            >
              <option value="">Todas</option>
              <option value="MERCADO_PAGO">Mercado Pago</option>
              <option value="MANUAL">Manual</option>
              <option value="COMPLIMENTARY">Cortesia</option>
              <option value="NONE">Nenhum</option>
            </Select>
          </FormField>
        </div>
      </Card>

      <Card className="overflow-hidden" padding="flush">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Lista de inscrições</caption>
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Inscrição
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Evento
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Origem
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Valor
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Criada em
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody aria-busy={showSkeleton || undefined}>
              {showSkeleton ? <TableSkeleton rows={6} columns={7} /> : null}
              {isError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-red-600">
                    {(error as Error)?.message ?? "Erro ao carregar inscrições"}
                  </td>
                </tr>
              ) : null}
              {!showSkeleton && !isError
                ? data?.data.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 transition-colors last:border-0 hover:bg-primary/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {item.nickname}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.responsibleName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.championship?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <SubscriptionStatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {originLabel[item.paymentOrigin]}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatMoney(item.amountPaid ?? item.amountEstimated)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/subscriptions/${item.id}`}
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
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    Nenhuma inscrição encontrada
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
            {data.total} inscrição(ões) · página {data.page} de {totalPages}
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
