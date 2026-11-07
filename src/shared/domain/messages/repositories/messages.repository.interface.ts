import type { Conversation, Message } from "../entities/message.entity";
import type { CreateConversationDto, SendMessageDto } from "@/shared/api/generated";
import type { OrganizationMemberRecord } from "../../organization";

export interface IMessagesRepository {
  listConversations(
    orgId?: string,
    currentUserId?: string,
    membersMap?: Map<string, OrganizationMemberRecord>,
  ): Promise<Conversation[]>;

  getConversationDetail(
    id: string,
    currentUserId?: string,
    membersMap?: Map<string, OrganizationMemberRecord>,
  ): Promise<{ conversation: Conversation; messages: Message[] }>;

  sendMessage(
    conversationId: string,
    payload: SendMessageDto,
  ): Promise<unknown>;

  createConversation(
    payload: CreateConversationDto,
  ): Promise<{ id: string; conversationId?: string }>;
}
