import api from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: User;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function signupRequest(payload: {
  name: string;
  email: string;
  password: string;
  level: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/signup", payload);
  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
}

export async function refreshTokenRequest(): Promise<{ accessToken: string }> {
  const { data } = await api.post<{ accessToken: string }>("/auth/refresh");
  return data;
}
