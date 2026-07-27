"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";
import { listAuditLogs } from "@/lib/admin-api";
import { formatDateTime } from "@/lib/format";

export default function AuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => listAuditLogs({ page, perPage: 50 }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;
  const showSkeleton = isLoading || (isFetching && !data);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governança"
        title="Auditoria"
        description="Histórico de ações administrativas na plataforma."
      />

      <Card className="overflow-hidden" padding="flush">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Logs de auditoria</caption>
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Quando
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Admin
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Ação
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Alvo
                </th>
              </tr>
            </thead>
            <tbody aria-busy={showSkeleton || undefined}>
              {showSkeleton ? <TableSkeleton rows={8} columns={4} /> : null}
              {isError ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-red-600">
                    {(error as Error)?.message ?? "Erro ao carregar auditoria"}
                  </td>
                </tr>
              ) : null}
              {!showSkeleton && !isError
                ? data?.data.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {log.admin.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.admin.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {log.targetType
                          ? `${log.targetType}${log.targetId ? ` · ${log.targetId.slice(0, 8)}…` : ""}`
                          : "—"}
                      </td>
                    </tr>
                  ))
                : null}
              {data && data.data.length === 0 && !showSkeleton && !isError ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    Nenhum registro
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
            {data.total} registro(s) · página {data.page} de {totalPages}
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
