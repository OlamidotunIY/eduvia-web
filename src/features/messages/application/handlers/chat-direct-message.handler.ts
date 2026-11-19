import { queryClient } from "@/shared/api";
import {
  WsEventHandler,
  WsEventType,
  type ChatDirectMessagePayload,
} from "@/shared/api/websocket";
import { MESSAGES_CONVERSATIONS_QUERY_KEY } from "../queries/use-conversations.query";
import { MESSAGES_DETAIL_QUERY_KEY } from "../queries/use-conversation-detail.query";

/** Refreshes message queries when a direct message notification arrives on the user channel. */
class ChatDirectMessageHandler extends WsEventHandler<ChatDirectMessagePayload> {
  readonly eventType = WsEventType.CHAT_DIRECT_MESSAGE;

  handle(payload: ChatDirectMessagePayload): void {
    void queryClient.invalidateQueries({
      queryKey: [MESSAGES_CONVERSATIONS_QUERY_KEY],
    });
    if (payload?.conversationId) {
      void queryClient.invalidateQueries({
        queryKey: [MESSAGES_DETAIL_QUERY_KEY, payload.conversationId],
      });
    } else {
      void queryClient.invalidateQueries({
        queryKey: [MESSAGES_DETAIL_QUERY_KEY],
      });
    }
  }
}

export const chatDirectMessageHandler = new ChatDirectMessageHandler();
