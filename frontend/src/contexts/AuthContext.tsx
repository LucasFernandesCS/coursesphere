import { createContext } from "react";
import type { User } from "../types/user";

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type AuthContextData = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext({} as AuthContextData);
