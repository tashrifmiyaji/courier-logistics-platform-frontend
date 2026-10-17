"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getPayment, startPayment } from "./api";

export function useStartPayment() {
  return useMutation({ mutationFn: startPayment });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ["payment-result", id],
    queryFn: () => getPayment(id),
    enabled: Boolean(id),
    retry: 2,
  });
}
