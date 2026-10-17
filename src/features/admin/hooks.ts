"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditTrail, getDashboardStats, getPeople } from "./api";

export function useAdminDashboard(enabled = true) {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboardStats,
    enabled,
  });
}

export function useAdminPeople(role?: string, enabled = true) {
  return useQuery({
    queryKey: role ? ["courier-list"] : ["people"],
    queryFn: () => getPeople(role),
    enabled,
  });
}

export function useAuditTrail(enabled = true) {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: getAuditTrail,
    enabled,
  });
}
