import type { CreateConversationDto, SendMessageDto } from "@/shared/api/generated";

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

export interface MessageProps {
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

export class Message {
  readonly id: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly senderAvatar?: string;
  readonly content: string;
  readonly createdAt: string;
  readonly isMine: boolean;
  readonly attachments?: MessageAttachment[];
  readonly reactions?: MessageReaction[];
  readonly isUnreadDividerBefore?: boolean;

  constructor(props: MessageProps) {
    this.id = props.id;
    this.senderId = props.senderId;
    this.senderName = props.senderName;
    this.senderAvatar = props.senderAvatar;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.isMine = props.isMine ?? false;
    this.attachments = props.attachments;
    this.reactions = props.reactions;
    this.isUnreadDividerBefore = props.isUnreadDividerBefore;
  }

  hasAttachments(): boolean {
    return Boolean(this.attachments && this.attachments.length > 0);
  }

  isSentBy(userId: string): boolean {
    return this.senderId === userId;
  }
}

export interface ConversationProps {
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
  messages?: Message[];
}

export class Conversation {
  readonly id: string;
  readonly type: ConversationType;
  readonly name: string;
  readonly subtitle?: string;
  readonly avatar?: string;
  readonly iconColor?: "emerald" | "purple" | "blue" | "amber" | "leaf";
  readonly iconType?: "users" | "graduation" | "calculator" | "shield" | "leaf";
  readonly online?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  readonly isPinned?: boolean;
  messages: Message[];

  constructor(props: ConversationProps) {
    this.id = props.id;
    this.type = props.type;
    this.name = props.name;
    this.subtitle = props.subtitle;
    this.avatar = props.avatar;
    this.iconColor = props.iconColor;
    this.iconType = props.iconType;
    this.online = props.online;
    this.lastMessage = props.lastMessage;
    this.lastMessageTime = props.lastMessageTime;
    this.unreadCount = props.unreadCount;
    this.isPinned = props.isPinned;
    this.messages = props.messages ?? [];
  }

  isGroup(): boolean {
    return this.type === "group";
  }

  hasUnread(): boolean {
    return this.unreadCount > 0;
  }

  addMessage(message: Message): void {
    this.messages.push(message);
    this.lastMessage = message.content;
    this.lastMessageTime = message.createdAt;
  }
}

export type { CreateConversationDto, SendMessageDto };
