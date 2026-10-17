import type { User } from "@/lib/api";
import apiClient from "@/lib/api-client";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export async function getCurrentUser() {
  return (await apiClient<User>("/users/me")).data;
}

export async function getNotifications() {
  return (await apiClient<Notification[]>("/users/notifications")).data;
}

export function markNotificationRead(id: string) {
  return apiClient(`/users/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });
}

export function updateCourierAvailability(
  availability: "AVAILABLE" | "BUSY" | "OFFLINE",
) {
  return apiClient("/users/courier/availability", {
    method: "PATCH",
    body: JSON.stringify({ availability }),
  });
}

export function updateProfile(payload: { name: string; phone: string | null }) {
  return apiClient("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
