import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionRepository } from "../../infrastructure";
import { questionDetailQueryKey } from "../queries/use-question-detail.query";
import { questionSummaryQueryKey } from "../queries/use-question-summary.query";

export function useUnpublishQuestionMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => {
      if (!organizationId) throw new Error("Organization context is required");
      return questionRepository.unpublish(organizationId, questionId);
    },
    onSuccess: (_data, questionId) => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["organizations", organizationId, "questions"],
        });
        queryClient.invalidateQueries({
          queryKey: questionSummaryQueryKey(organizationId),
        });
        queryClient.invalidateQueries({
          queryKey: questionDetailQueryKey(organizationId, questionId),
        });
      }
    },
  });
}
