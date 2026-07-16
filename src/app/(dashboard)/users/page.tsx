"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { RoleBadge, StatusBadge } from "@/components/ui/user-badges";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { listUsers } from "@/lib/admin-api";
import type { Role } from "@/lib/types";

const SEARCH_MIN_CHARS = 3;

export default function UsersPage() {
  const searchId = useId();
  const roleId = useId();
  const statusId = useId();
  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const search =
    debouncedSearch.length >= SEARCH_MIN_CHARS ? debouncedSearch : "";

  useEffect(() => {
    setPage(1);
  }, [search, role, isActive]);

  const filters = useMemo(
    () => ({ page, perPage: 20, search, role, isActive }),
    [page, search, role, isActive],
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => listUsers(filters),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;
  const showSkeleton = isLoading || (isFetching && !data);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Acesso"
        title="Contas"
        description="Gerencie acesso, papéis e status das contas da plataforma."
        actions={<ButtonLink href="/users/new">Nova conta</ButtonLink>}
      />

      <Card className="p-4 sm:p-5">
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
              placeholder="Nome, e-mail ou username"
              autoComplete="off"
            />
          </FormField>

          <FormField id={roleId} label="Papel">
            <Select
              id={roleId}
              value={role}
              onChange={(e) => setRole(e.target.value as Role | "")}
            >
              <option value="">Todos</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">Organizador</option>
              <option value="NO_ACCESS">Sem acesso</option>
            </Select>
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

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Lista de contas da plataforma</caption>
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Nome
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  E-mail
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Papel
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
              {showSkeleton ? <TableSkeleton rows={6} columns={5} /> : null}
              {isError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-red-600">
                    {(error as Error)?.message ?? "Erro ao carregar contas"}
                  </td>
                </tr>
              ) : null}
              {!showSkeleton && !isError
                ? data?.data.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 transition-colors last:border-0 hover:bg-primary/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={user.isActive} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/users/${user.id}`}
                          className="inline-flex min-h-[44px] cursor-pointer items-center text-sm font-medium text-primary underline-offset-2 hover:underline"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))
                : null}
              {data && data.data.length === 0 && !showSkeleton && !isError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    Nenhuma conta encontrada
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
            {data.total} conta(s) · página {data.page} de {totalPages}
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
