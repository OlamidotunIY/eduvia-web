import { useQuery } from "@tanstack/react-query";
import { messagesRepository } from "../../infrastructure";
import type { OrganizationMemberRecord } from "@/shared/domain";

export const MESSAGES_DETAIL_QUERY_KEY = "messages:detail";

export function useConversationDetailQuery(
  conversationId: string | null,
  currentUserId?: string,
  members?: OrganizationMemberRecord[],
) {
  const membersMap = members
    ? new Map(members.map((m) => [m.userId, m]))
    : undefined;

  return useQuery({
    queryKey: [MESSAGES_DETAIL_QUERY_KEY, conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      return messagesRepository.getConversationDetail(
        conversationId,
        currentUserId,
        membersMap,
      );
    },
    enabled: Boolean(conversationId),
    refetchInterval: 3000,
  });
}
