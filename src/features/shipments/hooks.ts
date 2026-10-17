"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ShipmentStatus } from "@/lib/api";
import {
  cancelShipment,
  createShipment,
  getShipment,
  listShipments,
  trackShipment,
  updateShipmentStatus,
  type ShipmentFilters,
} from "./api";

export const shipmentKeys = {
  all: ["shipments"] as const,
  list: (filters: ShipmentFilters) => ["shipments", filters] as const,
  detail: (id: string) => ["shipment", id] as const,
  tracking: (code: string) => ["public-tracking", code] as const,
};

export function useShipments(filters: ShipmentFilters = {}, enabled = true) {
  return useQuery({
    queryKey: shipmentKeys.list(filters),
    queryFn: () => listShipments(filters),
    enabled,
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: shipmentKeys.detail(id),
    queryFn: () => getShipment(id),
    enabled: Boolean(id),
  });
}

export function useTrackShipment() {
  return useMutation({ mutationFn: trackShipment });
}

export function useCreateShipment() {
  return useMutation({ mutationFn: createShipment });
}

export function useCancelShipment() {
  return useMutation({ mutationFn: cancelShipment });
}

export function useUpdateShipmentStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ShipmentStatus }) =>
      updateShipmentStatus(id, status),
  });
}
