"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
            <li key={`${line.label}-${line.unitAmount}-${line.unitAthleteFee}`}>
              {line.label}: {line.quantity} × {formatMoney(line.unitAmount)} ={" "}
              {formatMoney(line.totalAmount)}
              {line.totalAthleteFee > 0
                ? ` (taxa do atleta ${formatMoney(line.totalAthleteFee)})`
                : ""}
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
          <dt className="text-gray-500">Inscrições</dt>
          <dd className="font-medium">
            {formatMoney(data.totals.inscriptionTotal)}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Taxa paga pelo atleta</dt>
          <dd className="font-medium">
            {formatMoney(data.totals.athleteFeeAmount)}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">
            Comissão absorvida ({data.totals.wodfulFeePercent}%)
          </dt>
          <dd className="font-medium">
            {formatMoney(data.totals.absorbedFeeAmount)}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Ajustes de transferência</dt>
          <dd className="font-medium">
            {formatMoney(data.totals.transferGross)}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Total cobrado no Mercado Pago</dt>
          <dd className="font-medium">
            {formatMoney(data.totals.chargedTotal)}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">
            Custo MP estimado ({data.totals.mpFeePercent}%)
          </dt>
          <dd className="font-medium">{formatMoney(data.totals.mpFeeAmount)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Margem Wodful</dt>
          <dd className="font-medium">
            {formatMoney(data.totals.wodfulNetMargin)}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Inscrições pagantes</dt>
          <dd className="font-medium">
            {data.totals.payingSubscriptions} · {data.totals.payingAthletes}{" "}
            atleta(s)
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-gray-500">Líquido do organizador</dt>
          <dd className="font-semibold text-gray-900">
            {formatMoney(data.totals.organizerNet)}
          </dd>
        </div>
      </dl>

      {data.totals.passFeeToAthlete ? (
        <Badge variant="primary">Taxa repassada ao atleta</Badge>
      ) : null}

      <Button type="button" variant="secondary" onClick={onCopy}>
        {copied ? "Copiado" : "Copiar demonstrativo"}
      </Button>
    </Card>
  );
}
