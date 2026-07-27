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
import { StatusBadge } from "@/components/ui/user-badges";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { listChampionships } from "@/lib/admin-api";
import { formatDate, formatMoney } from "@/lib/format";

const SEARCH_MIN_CHARS = 3;

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <PageHeader eyebrow="Operação" title="Eventos" />
        </div>
      }
    >
      <EventsPageContent />
    </Suspense>
  );
}

function EventsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchId = useId();
  const statusId = useId();
  const [searchInput, setSearchInput] = useState("");
  const [isActive, setIsActive] = useState(searchParams.get("isActive") ?? "");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const search =
    debouncedSearch.length >= SEARCH_MIN_CHARS ? debouncedSearch : "";

  useEffect(() => {
    setPage(1);
  }, [search, isActive]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (isActive) params.set("isActive", isActive);
    const qs = params.toString();
    router.replace(qs ? `/events?${qs}` : "/events", { scroll: false });
  }, [isActive, router]);

  const filters = useMemo(
    () => ({ page, perPage: 20, search, isActive }),
    [page, search, isActive],
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["championships", filters],
    queryFn: () => listChampionships(filters),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;
  const showSkeleton = isLoading || (isFetching && !data);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Eventos"
        description="Busque campeonatos e abra o detalhe para financeiro e suporte."
      />

      <Card padding="compact">
        <div className="grid gap-4 sm:grid-cols-3">
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
              placeholder="Nome ou código de acesso"
              autoComplete="off"
            />
          </FormField>

          <FormField id={statusId} label="Status">
            <Select
              id={statusId}
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
          </FormField>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {showSkeleton
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padding="compact">
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </Card>
            ))
          : null}
        {isError ? (
          <AlertError message={(error as Error)?.message ?? "Erro ao carregar"} />
        ) : null}
        {!showSkeleton && !isError
          ? data?.data.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {event.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {event.accessCode}
                    </p>
                  </div>
                  <StatusBadge isActive={event.isActive} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <dt className="text-gray-400">Organizador</dt>
                    <dd className="truncate font-medium text-gray-800">
                      {event.organizer?.name ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Inscrições</dt>
                    <dd className="font-medium text-gray-800">
                      {event.counts.approved}/{event.counts.total}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Receita online</dt>
                    <dd className="font-medium text-gray-800">
                      {formatMoney(event.counts.revenuePaid)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Comissão</dt>
                    <dd className="font-medium text-gray-800">
                      {event.wodfulFeePercent}% ·{" "}
                      {formatMoney(event.counts.wodfulFeeAmount)}
                    </dd>
                  </div>
                </dl>
              </Link>
            ))
          : null}
        {data && data.data.length === 0 && !showSkeleton && !isError ? (
          <EmptyState message="Nenhum evento encontrado" />
        ) : null}
      </div>

      {/* Desktop table */}
      <Card className="hidden overflow-hidden md:block" padding="flush">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Lista de eventos</caption>
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Evento
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Organizador
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Período
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Inscrições
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Receita
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Taxa
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody aria-busy={showSkeleton || undefined}>
              {showSkeleton ? <TableSkeleton rows={6} columns={8} /> : null}
              {isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-red-600"
                  >
                    {(error as Error)?.message ?? "Erro ao carregar eventos"}
                  </td>
                </tr>
              ) : null}
              {!showSkeleton && !isError
                ? data?.data.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-gray-100 transition-colors last:border-0 hover:bg-primary/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {event.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.accessCode}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {event.organizer?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(event.startDate)} –{" "}
                        {formatDate(event.endDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {event.counts.approved}/{event.counts.total}
                        {event.counts.waiting > 0 ? (
                          <span className="ml-1 text-xs text-amber-700">
                            ({event.counts.waiting} ag.)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-600">
                        {formatMoney(event.counts.revenuePaid)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {event.wodfulFeePercent}%
                        <span className="block text-xs text-gray-400">
                          {formatMoney(event.counts.wodfulFeeAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={event.isActive} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/events/${event.id}`}
                          className="inline-flex min-h-[44px] cursor-pointer items-center text-sm font-medium text-primary underline-offset-2 hover:underline"
                        >
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  ))
                : null}
              {data && data.data.length === 0 && !showSkeleton && !isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Nenhum evento encontrado
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {data && data.total > 0 ? (
        <nav
          className="flex flex-wrap items-center justify-between gap-3 text-sm"
          aria-label="Paginação"
        >
          <span className="text-gray-500">
            {data.total} evento(s)
            {data.total > data.perPage
              ? ` · página ${data.page} de ${totalPages}`
              : null}
          </span>
          {data.total > data.perPage ? (
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
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

function AlertError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}
