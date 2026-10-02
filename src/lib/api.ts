export type Role = "CUSTOMER" | "COURIER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  courierProfile?: {
    availability: "AVAILABLE" | "BUSY" | "OFFLINE";
    totalDeliveries: number;
    earningsBalance: string | number;
  } | null;
};

export type ShipmentStatus =
  | "PENDING"
  | "PICKUP_SCHEDULED"
  | "PICKED_UP"
  | "AT_ORIGIN_HUB"
  | "IN_TRANSIT"
  | "AT_DESTINATION_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED_DELIVERY"
  | "RETURNED"
  | "CANCELLED";

export type Shipment = {
  id: string;
  trackingCode: string;
  status: ShipmentStatus;
  senderName: string;
  receiverName: string;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryCharge: string | number;
  createdAt: string;
  deliveredAt?: string | null;
  courier?: { user?: { name: string; phone?: string | null } } | null;
  pickupHub?: { name: string } | null;
  deliveryHub?: { name: string } | null;
  payments?: { id: string; status: string; amount: string | number }[];
  trackingEvents?: {
    status: ShipmentStatus;
    note?: string | null;
    location?: string | null;
    createdAt: string;
  }[];
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`/api/backend${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
  });
  const body = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { message?: string; errors?: { message?: string }[] }
    | null;

  if (!response.ok) {
    const message =
      body && "message" in body
        ? (body.message ?? body.errors?.[0]?.message)
        : undefined;
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("parcelpilot:unauthorized"));
    }
    throw new ApiError(message || "We couldn't complete that request.", response.status);
  }

  return body as ApiEnvelope<T>;
}

export function formatStatus(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

export function money(amount: string | number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}
