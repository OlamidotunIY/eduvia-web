import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import type {
  NotificationItem,
  NotificationStatus,
} from "../domain/notification.types";

export function useNotificationsQuery(status?: NotificationStatus) {
  return useQuery({
    queryKey: ["notifications", { status }],
    queryFn: async (): Promise<NotificationItem[]> => {
      try {
        const res = await apiClient.get<NotificationItem[]>("/notifications", {
          params: status ? { status } : undefined,
        });
        if (Array.isArray(res.data)) {
          return res.data;
        }
      } catch (err) {
        console.warn("Failed to fetch notifications:", err);
      }
      return [];
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Poll every 60 seconds as fallback
  });
}

export function useUnreadNotificationCountQuery() {
  return useQuery({
    queryKey: ["notifications", "count"],
    queryFn: async (): Promise<number> => {
      try {
        const res = await apiClient.get<{ unreadCount?: number; count?: number }>(
          "/notifications/count",
        );
        return res.data?.unreadCount ?? res.data?.count ?? 0;
      } catch {
        return 0;
      }
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await apiClient.post<{ success: boolean }>(
        "/notifications/mark-read",
        { notificationId },
      );
      return res.data;
    },
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Optimistic update for notifications list
      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old) return [];
          return old.map((n) =>
            n.id === notificationId
              ? { ...n, status: "read", readAt: new Date().toISOString() }
              : n,
          );
        },
      );

      // Optimistic update for unread count
      queryClient.setQueryData<number>(
        ["notifications", "count"],
        (old = 0) => Math.max(0, old - 1),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<{ success: boolean }>(
        "/notifications/mark-read",
        {},
      );
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old) return [];
          return old.map((n) => ({
            ...n,
            status: "read",
            readAt: n.readAt ?? new Date().toISOString(),
          }));
        },
      );

      queryClient.setQueryData<number>(["notifications", "count"], 0);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
