import type { User } from "@/lib/api";
import apiClient from "@/lib/api-client";

export type LoginPayload = { email: string; password: string };
export type RegistrationPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export async function login(payload: LoginPayload) {
  return (await apiClient<{ user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })).data.user;
}

export async function register(payload: RegistrationPayload) {
  return (await apiClient<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })).data;
}

export async function googleLogin(idToken: string) {
  return (await apiClient<{ user: User }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  })).data.user;
}

export function logout() {
  return apiClient("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
