import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateQuestionInput } from "@/shared/domain";
import { questionRepository } from "../../infrastructure";
import { questionSummaryQueryKey } from "../queries/use-question-summary.query";

export function useCreateQuestionMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuestionInput) => {
      if (!organizationId) throw new Error("Organization context is required");
      return questionRepository.create(organizationId, input);
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
