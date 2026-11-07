import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesRepository } from "../../infrastructure";
import type { SendMessageInput } from "@/shared/domain";
import { MESSAGES_CONVERSATIONS_QUERY_KEY } from "../queries/use-conversations.query";
import { MESSAGES_DETAIL_QUERY_KEY } from "../queries/use-conversation-detail.query";

export function useSendMessageMutation(conversationId: string | null, orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessageInput) => {
      if (!conversationId) throw new Error("No conversation selected");
      return messagesRepository.sendMessage(conversationId, payload);
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: [MESSAGES_DETAIL_QUERY_KEY, conversationId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: [MESSAGES_CONVERSATIONS_QUERY_KEY, orgId],
      });
    },
  });
}
