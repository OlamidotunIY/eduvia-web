import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesRepository } from "../../infrastructure";
import type { CreateConversationDto } from "@/shared/api/generated";
import { MESSAGES_CONVERSATIONS_QUERY_KEY } from "../queries/use-conversations.query";

export function useCreateConversationMutation(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation<{ id: string; conversationId?: string }, Error, CreateConversationDto>({
    mutationFn: async (payload: CreateConversationDto) => {
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
