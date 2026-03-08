"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  loginRequest,
  signupRequest,
  logoutRequest,
  type User,
} from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    name: string;
    email: string;
    password: string;
    level: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* Rehydrate from localStorage on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginRequest(email, password);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      router.push("/edit");
    },
    [router]
  );

  const signup = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      level: string;
    }) => {
      const data = await signupRequest(payload);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      router.push("/edit");
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // ignore — still clear local state
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
