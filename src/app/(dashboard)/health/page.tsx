"use client";

import { useQuery } from "@tanstack/react-query";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminHealth } from "@/lib/admin-api";
import { formatDateTime, formatUptime } from "@/lib/format";

export default function HealthPage() {
  const { data, isLoading, isError, error, dataUpdatedAt, refetch, isFetching } =
    useQuery({
      queryKey: ["admin-health"],
      queryFn: getAdminHealth,
      refetchInterval: 30_000,
    });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-8 w-16" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error">
        {(error as Error)?.message ?? "Erro ao verificar saúde"}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Infraestrutura"
        title="Saúde"
        description="Status da API, banco e Redis."
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {isFetching ? "Atualizando…" : "Atualizar"}
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <HealthCard label="API" status={data.api} />
        <HealthCard label="Database" status={data.database} />
        <HealthCard label="Redis" status={data.redis} />
      </div>

      <Card title="Detalhes">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Uptime</dt>
            <dd className="font-medium text-gray-900">
              {formatUptime(data.uptime)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Último webhook MP</dt>
            <dd className="font-medium text-gray-900">
              {formatDateTime(data.lastMpWebhookAt)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Checado em</dt>
            <dd className="font-medium text-gray-900">
              {formatDateTime(data.checkedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Atualização local</dt>
            <dd className="font-medium text-gray-900">
              {formatDateTime(new Date(dataUpdatedAt).toISOString())}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

function HealthCard({
  label,
  status,
}: {
  label: string;
  status: "up" | "down" | "unknown";
}) {
  const variant =
    status === "up" ? "success" : status === "down" ? "danger" : "muted";

  return (
    <Card padding="compact">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="mt-3">
        <Badge variant={variant}>{status.toUpperCase()}</Badge>
      </div>
    </Card>
  );
}
