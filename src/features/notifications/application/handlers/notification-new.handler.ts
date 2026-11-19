import { queryClient } from "@/shared/api";
import {
  WsEventHandler,
  WsEventType,
  type NotificationNewPayload,
} from "@/shared/api/websocket";
import type { NotificationItem } from "../../domain/notification.types";

/** Syncs incoming notifications into the query cache and unread counter. */
class NotificationNewHandler extends WsEventHandler<NotificationNewPayload> {
  readonly eventType = WsEventType.NOTIFICATION_NEW;

  handle(payload: NotificationNewPayload): void {
    if (payload?.id) {
      const incoming: NotificationItem = {
        id: payload.id,
        recipientId: payload.recipientId ?? "",
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        channel: payload.channel ?? "in_app",
        status: "unread",
        deliveredAt: payload.createdAt ?? new Date().toISOString(),
        readAt: null,
        createdAt: payload.createdAt ?? new Date().toISOString(),
      };

      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!Array.isArray(old)) return old;
          if (old.some((item) => item.id === incoming.id)) return old;
          return [incoming, ...old];
        },
      );

      queryClient.setQueryData<number>(
        ["notifications", "count"],
        (old = 0) => old + 1,
      );
    }

    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }
}

export const notificationNewHandler = new NotificationNewHandler();
