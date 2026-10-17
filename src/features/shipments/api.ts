import type { Shipment, ShipmentStatus } from "@/lib/api";
import apiClient from "@/lib/api-client";

export type ShipmentFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type CreateShipmentPayload = {
  senderName: string;
  senderPhone: string;
  pickupAddress: string;
  pickupHubId: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  deliveryHubId: string;
  weightKg: number;
  parcelType?: string;
  codAmount?: number;
  scheduledPickupAt?: string;
};
export type TrackingData = {
  trackingCode: string;
  status: ShipmentStatus;
  senderName: string;
  receiverName: string;
  createdAt: string;
  deliveredAt?: string | null;
  trackingEvents: NonNullable<Shipment["trackingEvents"]>;
};

export async function listShipments(filters: ShipmentFilters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return (await apiClient<Shipment[]>(`/shipments?${params.toString()}`)).data;
}

export async function getShipment(id: string) {
  return (await apiClient<Shipment>(`/shipments/${encodeURIComponent(id)}`)).data;
}

export async function trackShipment(trackingCode: string) {
  return (await apiClient<TrackingData>(
    `/shipments/track/${encodeURIComponent(trackingCode)}`,
  )).data;
}

export async function createShipment(payload: CreateShipmentPayload) {
  return (await apiClient<{ id: string; trackingCode: string }>("/shipments", {
    method: "POST",
    body: JSON.stringify(payload),
  })).data;
}

export function cancelShipment(id: string) {
  return apiClient(`/shipments/${encodeURIComponent(id)}/cancel`, {
    method: "PATCH",
  });
}

export function updateShipmentStatus(id: string, status: ShipmentStatus) {
  return apiClient(`/shipments/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function assignCourier(shipmentId: string, courierId: string) {
  return apiClient(`/shipments/${encodeURIComponent(shipmentId)}/assign`, {
    method: "POST",
    body: JSON.stringify({ courierId }),
  });
}
