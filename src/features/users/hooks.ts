"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getCurrentUser, getNotifications, markNotificationRead, updateCourierAvailability, updateProfile } from "./api";

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUser,
    enabled,
  });
}

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled,
  });
}

export function useMarkNotificationRead() {
  return useMutation({ mutationFn: markNotificationRead });
}

export function useUpdateCourierAvailability() {
  return useMutation({ mutationFn: updateCourierAvailability });
}

export function useUpdateProfile() {
  return useMutation({ mutationFn: updateProfile });
}
