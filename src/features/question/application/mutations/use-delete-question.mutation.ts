import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionRepository } from "../../infrastructure";
import { questionSummaryQueryKey } from "../queries/use-question-summary.query";

export function useDeleteQuestionMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => {
      if (!organizationId) throw new Error("Organization context is required");
      return questionRepository.delete(organizationId, questionId);
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["organizations", organizationId, "questions"],
        });
        queryClient.invalidateQueries({
          queryKey: questionSummaryQueryKey(organizationId),
        });
      }
    },
  });
}
