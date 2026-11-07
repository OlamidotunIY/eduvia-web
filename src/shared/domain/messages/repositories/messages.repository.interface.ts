import type {
  Conversation,
  CreateConversationInput,
  Message,
  SendMessageInput,
} from "../entities/message.entity";
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
    payload: SendMessageInput,
  ): Promise<unknown>;

  createConversation(
    payload: CreateConversationInput,
  ): Promise<{ id: string; conversationId?: string }>;
}
