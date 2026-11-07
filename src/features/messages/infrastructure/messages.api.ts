import { apiClient } from "@/shared/api";

export interface MessageBackendDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  status: string;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
}

export interface ConversationSummaryBackendDto {
  id: string;
  orgId: string;
  type: string;
  participants: string[];
  studentId: string | null;
  parentId: string | null;
  subject: string | null;
  status: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetailBackendDto extends ConversationSummaryBackendDto {
  messages: MessageBackendDto[];
}

export interface CreateConversationPayload {
  orgId: string;
  type: "student_teacher" | "parent_admin" | string;
  participants: string[];
  studentId?: string | null;
  parentId?: string | null;
  subject?: string | null;
}

export interface SendMessagePayload {
  content: string;
  attachmentUrl?: string | null;
}

export const messagesApi = {
  listConversations: async (orgId?: string): Promise<ConversationSummaryBackendDto[]> => {
    const response = await apiClient.get<ConversationSummaryBackendDto[]>("/conversations", {
      params: orgId ? { orgId } : undefined,
    });
    return response.data ?? [];
  },

  getConversationDetail: async (id: string): Promise<ConversationDetailBackendDto> => {
    const response = await apiClient.get<ConversationDetailBackendDto>(`/conversations/${id}`);
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    payload: SendMessagePayload,
  ): Promise<{ messageId: string }> => {
    const response = await apiClient.post<{ messageId: string }>(
      `/conversations/${conversationId}/messages`,
      payload,
    );
    return response.data;
  },

  createConversation: async (
    payload: CreateConversationPayload,
  ): Promise<{ id: string }> => {
    const response = await apiClient.post<{ id: string }>("/conversations", payload);
    return response.data;
  },

  closeConversation: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(`/conversations/${id}/close`);
    return response.data;
  },

  reopenConversation: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(`/conversations/${id}/reopen`);
    return response.data;
  },
};
