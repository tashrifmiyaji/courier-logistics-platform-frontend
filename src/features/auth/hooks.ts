"use client";

import { useMutation } from "@tanstack/react-query";
import { googleLogin, login, logout, register } from "./api";

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useRegistration() {
  return useMutation({ mutationFn: register });
}

export function useGoogleLogin() {
  return useMutation({ mutationFn: googleLogin });
}

export function useLogout() {
  return useMutation({ mutationFn: logout });
}
