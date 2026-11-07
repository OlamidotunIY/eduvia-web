export type ConversationType = "direct" | "group";

export type ConversationFilter = "all" | "unread" | "direct" | "groups";

export interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  url?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  isMine?: boolean;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  isUnreadDividerBefore?: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  subtitle?: string;
  avatar?: string;
  iconColor?: "emerald" | "purple" | "blue" | "amber" | "leaf";
  iconType?: "users" | "graduation" | "calculator" | "shield" | "leaf";
  online?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isPinned?: boolean;
  messages: Message[];
}

export interface SendMessageInput {
  content: string;
  attachmentUrl?: string | null;
}

export interface CreateConversationInput {
  orgId: string;
  type: string;
  participants: string[];
  studentId?: string | null;
  parentId?: string | null;
  subject?: string | null;
}
