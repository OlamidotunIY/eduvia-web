import { queryClient } from "@/shared/api";
import {
  WsEventHandler,
  WsEventType,
  type NotificationMarkedReadPayload,
} from "@/shared/api/websocket";
import type { NotificationItem } from "../../domain/notification.types";

/** Syncs notification read acknowledgements across active views and tabs. */
class NotificationMarkedReadHandler extends WsEventHandler<NotificationMarkedReadPayload> {
  readonly eventType = WsEventType.NOTIFICATION_MARKED_READ;

  handle(payload: NotificationMarkedReadPayload): void {
    if (payload?.notificationId) {
      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.map((item) =>
            item.id === payload.notificationId
              ? { ...item, status: "read", readAt: payload.readAt }
              : item,
          );
        },
      );
    }

    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }
}

export const notificationMarkedReadHandler =
  new NotificationMarkedReadHandler();
