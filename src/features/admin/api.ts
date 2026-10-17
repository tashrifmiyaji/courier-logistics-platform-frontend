import type { Role, User } from "@/lib/api";
import apiClient from "@/lib/api-client";

export type DashboardStats = {
  users: number;
  shipments: number;
  delivered: number;
  pendingPayments: number;
  paidRevenue: number;
};
export type AdminUser = User & {
  courierProfile?: {
    id: string;
    availability: string;
    vehicleType: "BICYCLE" | "BIKE" | "VAN" | "TRUCK";
  } | null;
};
export type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user?: { name: string; email: string } | null;
};

export async function getDashboardStats() {
  return (await apiClient<DashboardStats>("/admin/dashboard")).data;
}

export async function getPeople(role?: string) {
  const params = new URLSearchParams({ limit: "100" });
  if (role) params.set("role", role);
  return (await apiClient<AdminUser[]>(`/admin/users?${params.toString()}`)).data;
}

export async function getAuditTrail() {
  return (await apiClient<AuditEntry[]>("/admin/audit-logs?limit=50")).data;
}

export function createCourier(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  vehicleType: string;
}) {
  return apiClient("/admin/couriers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUserRole(id: string, role: Role) {
  return apiClient(`/admin/users/${encodeURIComponent(id)}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function deleteUser(id: string) {
  return apiClient(`/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
