import { ApiError, apiRequest } from "./api";
import { getToken } from "./auth-storage";
import type {
  AdminDashboard,
  AdminHealth,
  AdminLoginResponse,
  AuditLogItem,
  ChampionshipDetail,
  ChampionshipListItem,
  ImpersonateResponse,
  ListUsersResponse,
  PaginatedResponse,
  PaymentDetail,
  PaymentListItem,
  PaymentStatus,
  PublicUser,
  Role,
  SubscriptionDetail,
  SubscriptionListItem,
  SubscriptionPaymentOrigin,
  SubscriptionStatus,
  TotpSetupResponse,
  UserOverview,
  SettlementPreview,
} from "./types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

function buildQuery(params: Record<string, string | number | undefined | null>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export async function loginAdmin(
  email: string,
  password: string,
  totpCode?: string,
) {
  return apiRequest<AdminLoginResponse>("/admin/auth/login", {
    method: "POST",
    body: {
      email,
      password,
      ...(totpCode ? { totpCode } : {}),
    },
    auth: false,
  });
}

export async function getAdminMe() {
  return apiRequest<PublicUser>("/admin/auth/me");
}

export async function setupTotp() {
  return apiRequest<TotpSetupResponse>("/admin/auth/2fa/setup", {
    method: "POST",
  });
}

export async function verifyTotp(token: string) {
  return apiRequest<{ totpEnabled: true }>("/admin/auth/2fa/verify", {
    method: "POST",
    body: { token },
  });
}

export async function disableTotp(token: string) {
  return apiRequest<{ totpEnabled: false }>("/admin/auth/2fa/disable", {
    method: "POST",
    body: { token },
  });
}

export async function getDashboard() {
  return apiRequest<AdminDashboard>("/admin/dashboard");
}

export async function listChampionships(params: {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: string;
  userId?: string;
}) {
  return apiRequest<PaginatedResponse<ChampionshipListItem>>(
    `/admin/championships${buildQuery(params)}`,
  );
}

export async function getChampionship(id: string) {
  return apiRequest<ChampionshipDetail>(`/admin/championships/${id}`);
}

export async function updateChampionshipFees(
  id: string,
  payload: {
    wodfulFeePercent?: number;
    mpFeePercentEstimate?: number | null;
  },
) {
  return apiRequest<ChampionshipDetail>(`/admin/championships/${id}/fees`, {
    method: "PATCH",
    body: payload,
  });
}

export async function getChampionshipSettlement(id: string) {
  return apiRequest<SettlementPreview>(`/admin/championships/${id}/settlement`);
}

export async function listUsers(params: {
  page?: number;
  perPage?: number;
  search?: string;
  role?: Role | "";
  isActive?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("perPage", String(params.perPage));
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.isActive === "true" || params.isActive === "false") {
    query.set("isActive", params.isActive);
  }
  const qs = query.toString();
  return apiRequest<ListUsersResponse>(`/admin/users${qs ? `?${qs}` : ""}`);
}

export async function getUser(id: string) {
  return apiRequest<PublicUser>(`/admin/users/${id}`);
}

export async function getUserOverview(id: string) {
  return apiRequest<UserOverview>(`/admin/users/${id}/overview`);
}

export async function impersonateUser(id: string) {
  return apiRequest<ImpersonateResponse>(`/admin/users/${id}/impersonate`, {
    method: "POST",
  });
}

export async function updateUserDefaultFee(
  id: string,
  defaultWodfulFeePercent: number | null,
) {
  return apiRequest<{
    userId: string;
    defaultWodfulFeePercent: number | null;
  }>(`/admin/users/${id}/default-fee`, {
    method: "PATCH",
    body: { defaultWodfulFeePercent },
  });
}

export async function createUser(payload: {
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
}) {
  return apiRequest<PublicUser>("/admin/users", {
    method: "POST",
    body: payload,
  });
}

export async function updateUser(
  id: string,
  payload: {
    name?: string;
    username?: string;
    email?: string;
    role?: Role;
  },
) {
  return apiRequest<PublicUser>(`/admin/users/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function updateUserStatus(id: string, isActive: boolean) {
  return apiRequest<PublicUser>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: { isActive },
  });
}

export async function resetUserPassword(id: string, password: string) {
  return apiRequest<void>(`/admin/users/${id}/password`, {
    method: "PATCH",
    body: { password },
  });
}

export async function updateOwnPassword(
  currentPassword: string,
  newPassword: string,
) {
  return apiRequest<void>("/admin/users/me/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}

export async function listSubscriptions(params: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: SubscriptionStatus | "";
  paymentOrigin?: SubscriptionPaymentOrigin | "";
  championshipId?: string;
}) {
  return apiRequest<PaginatedResponse<SubscriptionListItem>>(
    `/admin/subscriptions${buildQuery(params)}`,
  );
}

export async function getSubscription(id: string) {
  return apiRequest<SubscriptionDetail>(`/admin/subscriptions/${id}`);
}

export async function approveSubscription(id: string) {
  return apiRequest<void>(`/admin/subscriptions/${id}/approve`, {
    method: "PUT",
  });
}

export async function declineSubscription(id: string) {
  return apiRequest<void>(`/admin/subscriptions/${id}/decline`, {
    method: "PUT",
  });
}

export async function setSubscriptionComplimentary(
  id: string,
  isComplimentary: boolean,
) {
  return apiRequest<{
    id: string;
    isComplimentary: boolean;
    status: SubscriptionStatus;
  }>(`/admin/subscriptions/${id}/complimentary`, {
    method: "PUT",
    body: { isComplimentary },
  });
}

export async function createSubscriptionPaymentLink(id: string) {
  return apiRequest<{ paymentId: string; paymentUrl: string }>(
    `/admin/subscriptions/${id}/payment-link`,
    { method: "POST" },
  );
}

export async function listPayments(params: {
  page?: number;
  perPage?: number;
  status?: PaymentStatus | "";
  championshipId?: string;
  search?: string;
  isComplimentary?: string;
  subscriptionStatus?: SubscriptionStatus | "";
}) {
  return apiRequest<PaginatedResponse<PaymentListItem>>(
    `/admin/payments${buildQuery(params)}`,
  );
}

export async function getPayment(id: string) {
  return apiRequest<PaymentDetail>(`/admin/payments/${id}`);
}

export async function exportPayments(params: {
  status?: PaymentStatus | "";
  championshipId?: string;
  from?: string;
  to?: string;
}) {
  const token = getToken();
  const response = await fetch(
    `${baseUrl}/admin/payments/export${buildQuery(params)}`,
    {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    if (response.status === 401) {
      throw new ApiError(data.message ?? "Unauthorized", 401);
    }
    throw new ApiError(data.message ?? "Falha ao exportar pagamentos", response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "payments.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function getAdminHealth() {
  return apiRequest<AdminHealth>("/admin/health");
}

export async function listAuditLogs(params: {
  page?: number;
  perPage?: number;
}) {
  return apiRequest<PaginatedResponse<AuditLogItem>>(
    `/admin/audit-logs${buildQuery(params)}`,
  );
}

