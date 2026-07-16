import { apiRequest } from "./api";
import type {
  AdminLoginResponse,
  ListUsersResponse,
  PublicUser,
  Role,
} from "./types";

export async function loginAdmin(email: string, password: string) {
  return apiRequest<AdminLoginResponse>("/admin/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export async function getAdminMe() {
  return apiRequest<PublicUser>("/admin/auth/me");
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
