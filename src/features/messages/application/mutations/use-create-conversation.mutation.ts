import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesRepository } from "../../infrastructure";
import type { CreateConversationInput } from "@/shared/domain";
import { MESSAGES_CONVERSATIONS_QUERY_KEY } from "../queries/use-conversations.query";

export function useCreateConversationMutation(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation<{ id: string; conversationId?: string }, Error, CreateConversationInput>({
    mutationFn: async (payload: CreateConversationInput) => {
      return messagesRepository.createConversation(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [MESSAGES_CONVERSATIONS_QUERY_KEY, orgId],
      });
      return data;
    },
  });
}
