import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, getToken, clearToken, type Profile } from "./api";

type AuthState = {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; full_name: string; organization_name: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api.auth
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const profile = await api.auth.login(email, password);
    setUser(profile);
  };

  const register = async (input: { email: string; password: string; full_name: string; organization_name: string }) => {
    const profile = await api.auth.register(input);
    setUser(profile);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      // Limpia la sesión local incluso si la llamada de red falla — nunca
      // dejar al usuario "atrapado" en un estado autenticado a medias.
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
