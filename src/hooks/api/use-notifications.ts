import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGetPaginated, apiPatch } from "@/lib/api-client";
import type { ListQueryParams } from "@/types/api";
import type { AppNotification } from "@/types/system";

const KEY = "notifications";

export function useNotifications(params?: ListQueryParams) {
  return useQuery({
    queryKey: [KEY, "list", params ?? {}],
    queryFn: () => apiGetPaginated<AppNotification>("/notifications", { params }),
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: [KEY, "unread"],
    queryFn: () => apiGetPaginated<AppNotification>("/notifications", { params: { is_read: false, limit: 5 } }),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch<AppNotification>(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPatch<void>("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}
