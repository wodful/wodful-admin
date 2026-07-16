const TOKEN_KEY = "@WodfulAdmin:tkn";
const USER_KEY = "@WodfulAdmin:usr";

export type StoredAdminUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredAdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAdminUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: StoredAdminUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
