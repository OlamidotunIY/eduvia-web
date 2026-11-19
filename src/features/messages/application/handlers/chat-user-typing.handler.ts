import {
  WsEventHandler,
  WsEventType,
  type ChatUserTypingPayload,
} from "@/shared/api/websocket";
import { messagesRealtimeService } from "../services/messages-realtime.service";

/** Updates live typing indicator state for active conversations. */
class ChatUserTypingHandler extends WsEventHandler<ChatUserTypingPayload> {
  readonly eventType = WsEventType.CHAT_USER_TYPING;

  handle(payload: ChatUserTypingPayload): void {
    if (!payload?.conversationId || !payload?.userId) return;
    messagesRealtimeService.setTyping(
      payload.conversationId,
      payload.userId,
      Boolean(payload.isTyping),
    );
  }
}

export const chatUserTypingHandler = new ChatUserTypingHandler();
