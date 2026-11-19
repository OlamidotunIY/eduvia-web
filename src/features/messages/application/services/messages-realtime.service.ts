import { chatWsConnection } from "@/shared/api";

type Listener = () => void;

const EMPTY_TYPING_USERS: string[] = [];

class MessagesRealtimeService {
  private readonly typingMap = new Map<string, Map<string, number>>();
  private readonly snapshots = new Map<string, string[]>();
  private readonly listeners = new Set<Listener>();

  setTyping(conversationId: string, userId: string, isTyping: boolean): void {
    if (!conversationId || !userId) return;

    const currentTimers =
      this.typingMap.get(conversationId) ?? new Map<string, number>();

    const existingTimer = currentTimers.get(userId);
    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer);
      currentTimers.delete(userId);
    }

    if (isTyping) {
      const timeoutId = window.setTimeout(() => {
        this.setTyping(conversationId, userId, false);
      }, 4000);
      currentTimers.set(userId, timeoutId);
      this.typingMap.set(conversationId, currentTimers);
    } else if (currentTimers.size === 0) {
      this.typingMap.delete(conversationId);
    }

    const nextIds = Array.from(currentTimers.keys());
    if (nextIds.length === 0) {
      this.snapshots.delete(conversationId);
    } else {
      this.snapshots.set(conversationId, nextIds);
    }

    this.listeners.forEach((listener) => listener());
  }

  getTypingUserIds(conversationId: string | null | undefined): string[] {
    if (!conversationId) return EMPTY_TYPING_USERS;
    return this.snapshots.get(conversationId) ?? EMPTY_TYPING_USERS;
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
}

export const messagesRealtimeService = new MessagesRealtimeService();

export function joinConversationRoom(conversationId: string): () => void {
  return chatWsConnection.joinRoom("chat:join", "chat:leave", {
    conversationId,
  });
}

export function emitConversationTyping(
  conversationId: string,
  isTyping: boolean,
): void {
  chatWsConnection.emit("chat:typing", { conversationId, isTyping });
}
