import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagesRepository } from "../../infrastructure/messages.repository";
import type { OrganizationMemberRecord } from "@/features/organization/domain/member.types";

export const MESSAGES_QUERY_KEYS = {
  all: ["messages"] as const,
  conversations: (orgId?: string) => ["messages", "conversations", orgId] as const,
  detail: (id?: string | null) => ["messages", "detail", id] as const,
};

export function useConversationsQuery(
  orgId?: string,
  currentUserId?: string,
  members?: OrganizationMemberRecord[],
) {
  const membersMap = members
    ? new Map(members.map((m) => [m.userId, m]))
    : undefined;

  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.conversations(orgId),
    queryFn: async () => {
      return messagesRepository.listConversations(orgId, currentUserId, membersMap);
    },
    enabled: true,
    refetchInterval: 5000, // Poll every 5s for real-time conversation updates
  });
}

export function useConversationDetailQuery(
  conversationId: string | null,
  currentUserId?: string,
  members?: OrganizationMemberRecord[],
) {
  const membersMap = members
    ? new Map(members.map((m) => [m.userId, m]))
    : undefined;

  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.detail(conversationId),
    queryFn: async () => {
      if (!conversationId) return null;
      return messagesRepository.getConversationDetail(
        conversationId,
        currentUserId,
        membersMap,
      );
    },
    enabled: Boolean(conversationId),
    refetchInterval: 3000, // Poll every 3s when conversation is open
  });
}

export function useSendMessageMutation(conversationId: string | null, orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { content: string; attachmentUrl?: string | null }) => {
      if (!conversationId) throw new Error("No conversation selected");
      return messagesRepository.sendMessage(conversationId, payload);
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: MESSAGES_QUERY_KEYS.detail(conversationId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.conversations(orgId),
      });
    },
  });
}

export function useCreateConversationMutation(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      orgId: string;
      type: string;
      participants: string[];
      studentId?: string | null;
      parentId?: string | null;
      subject?: string | null;
    }) => {
      return messagesRepository.createConversation(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.conversations(orgId),
      });
      return data;
    },
  });
}
