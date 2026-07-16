export type Role = "NO_ACCESS" | "USER" | "ADMIN";

export type PublicUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

export type AdminLoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: Role;
  };
  requires2fa: boolean;
};

export type ListUsersResponse = {
  data: PublicUser[];
  total: number;
  page: number;
  perPage: number;
};

export type ApiErrorBody = {
  message?: string;
};
