import type {
  PaymentStatus,
  Role,
  SubscriptionStatus,
} from "@/lib/types";

import { Badge } from "./badge";

function roleLabel(role: Role) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "USER":
      return "Organizador";
    case "NO_ACCESS":
      return "Sem acesso";
    default:
      return role;
  }
}

export function RoleBadge({ role }: { role: Role }) {
  const variant =
    role === "ADMIN" ? "primary" : role === "USER" ? "default" : "danger";

  return <Badge variant={variant}>{roleLabel(role)}</Badge>;
}

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "muted"}>
      {isActive ? "Ativo" : "Inativo"}
    </Badge>
  );
}

export function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionStatus;
}) {
  const map = {
    WAITING: { label: "Aguardando", variant: "muted" as const },
    APPROVED: { label: "Aprovada", variant: "success" as const },
    DECLINED: { label: "Recusada", variant: "danger" as const },
  };
  const item = map[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const map = {
    PENDING: { label: "Pendente", variant: "muted" as const },
    PAID: { label: "Pago", variant: "success" as const },
    CANCELLED: { label: "Cancelado", variant: "danger" as const },
    EXPIRED: { label: "Expirado", variant: "danger" as const },
  };
  const item = map[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
