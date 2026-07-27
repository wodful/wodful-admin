"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getAdminMe, loginAdmin } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import {
  clearSession,
  getStoredUser,
  getToken,
  setSession,
  type StoredAdminUser,
} from "@/lib/auth-storage";

type LoginResult = {
  requires2fa: boolean;
};

type AuthContextValue = {
  user: StoredAdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    totpCode?: string,
  ) => Promise<LoginResult>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    const me = await getAdminMe();
    const nextUser: StoredAdminUser = {
      id: me.id,
      name: me.name,
      email: me.email,
      username: me.username,
      role: me.role,
      totpEnabled: me.totpEnabled,
    };
    setSession(token, nextUser);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        const stored = getStoredUser();
        const token = getToken();
        if (!token || !stored) {
          setUser(null);
          return;
        }
        setUser(stored);
        await refreshMe();
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void boot();
  }, [refreshMe]);

  const login = useCallback(
    async (
      email: string,
      password: string,
      totpCode?: string,
    ): Promise<LoginResult> => {
      const result = await loginAdmin(email, password, totpCode);

      if (result.requires2fa) {
        return { requires2fa: true };
      }

      if (!result.token) {
        throw new ApiError("Token de autenticação ausente", 401);
      }

      const nextUser: StoredAdminUser = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        username: result.user.username,
        role: result.user.role,
        totpEnabled: Boolean(result.user.totpEnabled),
      };
      setSession(result.token, nextUser);
      setUser(nextUser);
      return { requires2fa: false };
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshMe,
    }),
    [user, isLoading, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.message.includes("inactive")) {
      return "Conta desativada. Fale com um administrador.";
    }
    if (err.message.includes("Admin access")) {
      return "Esta conta não tem acesso administrativo.";
    }
    if (err.message.includes("incorrect") || err.message.includes("Invalid")) {
      return "E-mail, senha ou código 2FA incorretos.";
    }
    if (err.message.toLowerCase().includes("totp") || err.message.toLowerCase().includes("2fa")) {
      return "Código 2FA inválido.";
    }
    return err.message;
  }
  return "Não foi possível autenticar.";
}
