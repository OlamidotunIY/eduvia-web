import {
  Conversation,
  type ConversationType,
  type IMessagesRepository,
  Message,
  type OrganizationMemberRecord,
} from "@/shared/domain";
import type {
  ConversationDetailDto,
  ConversationSummaryDto,
  CreateConversationDto,
  MessageDto,
  SendMessageDto,
} from "@/shared/api/generated";
import { messagesApi } from "../rest/messages.api";

export class MessagesRepository implements IMessagesRepository {
  async listConversations(
    orgId?: string,
    currentUserId?: string,
    membersMap?: Map<string, OrganizationMemberRecord>,
  ): Promise<Conversation[]> {
    const dtos = await messagesApi.listConversations(orgId);
    return dtos.map((dto) => this.mapBackendSummaryToDomain(dto, currentUserId, membersMap));
  }

  async getConversationDetail(
    id: string,
    currentUserId?: string,
    membersMap?: Map<string, OrganizationMemberRecord>,
  ): Promise<{ conversation: Conversation; messages: Message[] }> {
    const dto: ConversationDetailDto = await messagesApi.getConversationDetail(id);
    const conversation = this.mapBackendSummaryToDomain(dto, currentUserId, membersMap);
    const messages = (dto.messages ?? []).map((m: MessageDto) =>
      this.mapBackendMessageToDomain(m, currentUserId, membersMap),
    );
    conversation.messages = messages;
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      conversation.lastMessage = last.content;
      conversation.lastMessageTime = last.createdAt;
    }
    return { conversation, messages };
  }

  async sendMessage(
    conversationId: string,
    payload: SendMessageDto,
  ): Promise<unknown> {
    return messagesApi.sendMessage(conversationId, payload);
  }

  async createConversation(
    payload: CreateConversationDto,
  ): Promise<{ id: string; conversationId?: string }> {
    return messagesApi.createConversation(payload);
  }

  private formatTimestamp(isoString?: string | null): string {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return "Yesterday";
    }

    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  private mapBackendMessageToDomain(
    dto: MessageDto,
    currentUserId?: string,
    membersMap?: Map<string, OrganizationMemberRecord>,
  ): Message {
    const member = membersMap?.get(dto.senderId);
    const isMine = currentUserId ? dto.senderId === currentUserId : false;

    let senderName = "Participant";
    let senderAvatar: string | undefined = undefined;

    if (isMine) {
      senderName = "You";
    } else if (member?.user) {
      const fullName = `${member.user.firstName ?? ""} ${member.user.lastName ?? ""}`.trim();
      senderName = fullName || member.user.email || "Participant";
      senderAvatar = member.user.image ?? undefined;
    }

    return new Message({
      id: dto.id,
      senderId: dto.senderId,
      senderName,
      senderAvatar,
      content: dto.content,
      createdAt: this.formatTimestamp(dto.sentAt),
      isMine,
      attachments: dto.attachmentUrl
        ? [
            {
              id: `att-${dto.id}`,
              name: dto.attachmentUrl.split("/").pop() ?? "Attachment",
              size: "",
              mimeType: "application/octet-stream",
              url: dto.attachmentUrl,
            },
          ]
        : undefined,
      reactions: [],
    });
  }

  private mapBackendSummaryToDomain(
    dto: ConversationSummaryDto,
    currentUserId?: string,
    membersMap?: Map<string, OrganizationMemberRecord>,
  ): Conversation {
    const isGroup = dto.participants.length > 2 || dto.type === "group";
    const convType: ConversationType = isGroup ? "group" : "direct";

    const otherParticipantId = dto.participants.find((p) => p !== currentUserId);
    const otherMember = otherParticipantId ? membersMap?.get(otherParticipantId) : undefined;

    let displayName = dto.subject ?? "Conversation";
    let subtitle: string | undefined = undefined;
    let avatar: string | undefined = undefined;

    if (otherMember?.user) {
      const fullName = `${otherMember.user.firstName ?? ""} ${otherMember.user.lastName ?? ""}`.trim();
      displayName = dto.subject || fullName || otherMember.user.email;
      subtitle = otherMember.role ?? "Member";
      avatar = otherMember.user.image ?? undefined;
    } else if (!dto.subject && otherParticipantId) {
      displayName = `Chat (${otherParticipantId.slice(0, 6)}...)`;
    }

    return new Conversation({
      id: dto.id,
      type: convType,
      name: displayName,
      subtitle,
      avatar,
      iconColor: isGroup ? "emerald" : undefined,
      iconType: isGroup ? "users" : undefined,
      lastMessage: undefined,
      lastMessageTime: this.formatTimestamp(dto.lastMessageAt ?? dto.updatedAt),
      unreadCount: 0,
      messages: [],
    });
  }
}

export const messagesRepository = new MessagesRepository();
