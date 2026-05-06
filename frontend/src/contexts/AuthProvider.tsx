import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../services/api";
import type { User } from "../types/user";
import { AuthContext } from "./AuthContext";
import type { LoginData, RegisterData } from "./AuthContext";

type AuthResponse = {
  user: User;
  token: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function register(data: RegisterData) {
    const response = await api.post<AuthResponse>("/auth/register", data);

    localStorage.setItem("@CourseSphere:token", response.data.token);
    setUser(response.data.user);
    api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
  }

  async function login(data: LoginData) {
    const response = await api.post<AuthResponse>("/auth/login", data);

    localStorage.setItem("@CourseSphere:token", response.data.token);
    setUser(response.data.user);
    api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
  }

  function logout() {
    localStorage.removeItem("@CourseSphere:token");
    setUser(null);
    delete api.defaults.headers.common.Authorization;
  }

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("@CourseSphere:token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        const response = await api.get<{ user: User }>("/auth/me");

        setUser(response.data.user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
