import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateQuestionInput } from "@/shared/domain";
import { questionRepository } from "../../infrastructure";
import { questionDetailQueryKey } from "../queries/use-question-detail.query";

export function useUpdateQuestionMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      input,
    }: {
      questionId: string;
      input: UpdateQuestionInput;
    }) => {
      if (!organizationId) throw new Error("Organization context is required");
      return questionRepository.update(organizationId, questionId, input);
    },
    onSuccess: (_data, variables) => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["organizations", organizationId, "questions"],
        });
        queryClient.invalidateQueries({
          queryKey: questionDetailQueryKey(organizationId, variables.questionId),
        });
      }
    },
  });
}
