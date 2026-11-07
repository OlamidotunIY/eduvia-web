import { useQuery } from "@tanstack/react-query";
import { messagesRepository } from "../../infrastructure";
import type { OrganizationMemberRecord } from "@/shared/domain";

export const MESSAGES_CONVERSATIONS_QUERY_KEY = "messages:conversations";

export function useConversationsQuery(
  orgId?: string,
  currentUserId?: string,
  members?: OrganizationMemberRecord[],
) {
  const membersMap = members
    ? new Map(members.map((m) => [m.userId, m]))
    : undefined;

  return useQuery({
    queryKey: [MESSAGES_CONVERSATIONS_QUERY_KEY, orgId],
    queryFn: async () => {
      if (!orgId) return [];
      return messagesRepository.listConversations(orgId, currentUserId, membersMap);
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
