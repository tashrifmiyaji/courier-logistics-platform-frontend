import apiClient from "@/lib/api-client";

export type Hub = {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  zoneId?: string | null;
  isActive: boolean;
  zone?: { name: string } | null;
};
export type Zone = { id: string; name: string };
export type RouteQuote = {
  deliveryCharge: number;
  baseFare: number;
  perKgRate: number;
  weightKg: number;
};
export type QuotePayload = {
  fromHubId: string;
  toHubId: string;
  weightKg: number;
};

export async function getHubs(activeOnly = false) {
  const suffix = activeOnly ? "?active=true" : "";
  return (await apiClient<Hub[]>(`/operations/hubs${suffix}`)).data;
}

export async function getZones() {
  return (await apiClient<Zone[]>("/operations/zones")).data;
}

export async function calculateRoutePrice(payload: QuotePayload) {
  return (await apiClient<RouteQuote>("/operations/pricing/calculate", {
    method: "POST",
    body: JSON.stringify(payload),
  })).data;
}

export function createZone(name: string) {
  return apiClient("/operations/zones", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function createHub(payload: {
  name: string;
  code: string;
  city: string;
  address: string;
  zoneId: string;
}) {
  return apiClient("/operations/hubs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function setHubActive(id: string, isActive: boolean) {
  return apiClient(`/operations/hubs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export function deleteHub(id: string) {
  return apiClient(`/operations/hubs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function savePricing(payload: {
  fromZoneId: string;
  toZoneId: string;
  baseFare: number;
  perKgRate: number;
}) {
  return apiClient("/operations/pricing", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
