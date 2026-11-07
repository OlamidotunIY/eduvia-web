import { apiClient } from "@/shared/api";
import type {
  ConversationDetailDto,
  ConversationSummaryDto,
  CreateConversationDto,
  SendMessageDto,
} from "@/shared/api/generated";

export const messagesApi = {
  listConversations: async (orgId?: string): Promise<ConversationSummaryDto[]> => {
    const response = await apiClient.get<ConversationSummaryDto[]>("/conversations", {
      params: orgId ? { orgId } : undefined,
    });
    return response.data;
  },

  getConversationDetail: async (id: string): Promise<ConversationDetailDto> => {
    const response = await apiClient.get<ConversationDetailDto>(`/conversations/${id}`);
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    payload: SendMessageDto,
  ): Promise<unknown> => {
    const response = await apiClient.post(
      `/conversations/${conversationId}/messages`,
      payload,
    );
    return response.data;
  },

  createConversation: async (
    payload: CreateConversationDto,
  ): Promise<{ id: string; conversationId?: string }> => {
    const response = await apiClient.post<{ id: string; conversationId?: string }>(
      "/conversations",
      payload,
    );
    return response.data;
  },
};
