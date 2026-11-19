import { queryClient } from "@/shared/api";
import {
  WsEventHandler,
  WsEventType,
  type ChatNewMessagePayload,
} from "@/shared/api/websocket";
import { MESSAGES_CONVERSATIONS_QUERY_KEY } from "../queries/use-conversations.query";
import { MESSAGES_DETAIL_QUERY_KEY } from "../queries/use-conversation-detail.query";

/** Refreshes conversation list and active thread when a new message arrives in a joined room. */
class ChatNewMessageHandler extends WsEventHandler<ChatNewMessagePayload> {
  readonly eventType = WsEventType.CHAT_NEW_MESSAGE;

  handle(payload: ChatNewMessagePayload): void {
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

export const chatNewMessageHandler = new ChatNewMessageHandler();
