"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormSkeleton } from "@/components/ui/skeleton";
import { getChampionshipSettlement } from "@/lib/admin-api";
import { formatMoney } from "@/lib/format";

export function SettlementReportCard({ championshipId }: { championshipId: string }) {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["championship-settlement", championshipId],
    queryFn: () => getChampionshipSettlement(championshipId),
  });

  async function onCopy() {
    if (!data?.copyText) return;
    await navigator.clipboard.writeText(data.copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <Card title="Demonstrativo">
        <FormSkeleton />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error">
        {(error as Error)?.message ?? "Erro ao carregar demonstrativo"}
      </Alert>
    );
  }

  return (
    <Card
      title="Demonstrativo"
      description="Resumo das inscrições aprovadas para colar no documento de repasse."
      className="space-y-4"
    >
      {data.lines.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhuma inscrição paga encontrada.
        </p>
      ) : (
        <ul className="max-h-72 space-y-1.5 overflow-y-auto text-sm text-gray-700">
          {data.lines.map((line) => (
            <li key={`${line.label}-${line.unitAmount}`}>
              {line.label}: {line.quantity} × {formatMoney(line.unitAmount)} ={" "}
              {formatMoney(line.totalAmount)}
            </li>
          ))}
        </ul>
      )}

      {data.complimentary.length > 0 ? (
        <div>
          <p className="text-sm font-medium text-gray-800">
            Isentos ({data.complimentary.length})
          </p>
          <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-sm text-gray-600">
            {data.complimentary.map((item) => (
              <li key={item.name}>· {item.name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <dl className="grid gap-2 border-t border-gray-100 pt-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gray-500">Bruto</dt>
          <dd className="font-medium">{formatMoney(data.totals.gross)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">
            Comissão ({data.totals.wodfulFeePercent}%)
          </dt>
          <dd className="font-medium">
            {formatMoney(data.totals.wodfulFeeAmount)}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Inscrições pagantes</dt>
          <dd className="font-medium">
            {data.totals.payingSubscriptions} · {data.totals.payingAthletes}{" "}
            atleta(s)
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Líquido (bruto − comissão)</dt>
          <dd className="font-semibold text-gray-900">
            {formatMoney(data.totals.organizerNet)}
          </dd>
        </div>
      </dl>

      <Button type="button" variant="secondary" onClick={onCopy}>
        {copied ? "Copiado" : "Copiar demonstrativo"}
      </Button>
    </Card>
  );
}
