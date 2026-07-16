import type { Role } from "@/lib/types";

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
