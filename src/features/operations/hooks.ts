"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { calculateRoutePrice, getHubs, getZones, type QuotePayload } from "./api";

export function useHubs(activeOnly = false, enabled = true) {
  return useQuery({
    queryKey: ["hubs", { activeOnly }],
    queryFn: () => getHubs(activeOnly),
    enabled,
  });
}

export function useZones(enabled = true) {
  return useQuery({ queryKey: ["zones"], queryFn: getZones, enabled });
}

export function useRoutePrice() {
  return useMutation({
    mutationFn: (payload: QuotePayload) => calculateRoutePrice(payload),
  });
}
