import { queryClient } from "@/shared/api";
import {
  WsEventHandler,
  WsEventType,
  type NotificationCountPayload,
} from "@/shared/api/websocket";

/** Updates the unread notification counter badge from server push events. */
class NotificationCountHandler extends WsEventHandler<NotificationCountPayload> {
  readonly eventType = WsEventType.NOTIFICATION_COUNT;

  handle(payload: NotificationCountPayload): void {
    if (typeof payload?.unreadCount !== "number") return;
    queryClient.setQueryData<number>(
      ["notifications", "count"],
      Math.max(0, payload.unreadCount),
    );
  }
}

export const notificationCountHandler = new NotificationCountHandler();
