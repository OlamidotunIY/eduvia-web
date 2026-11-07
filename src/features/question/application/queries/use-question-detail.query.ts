import { useQuery } from "@tanstack/react-query";
import { questionRepository } from "../../infrastructure";

export const questionDetailQueryKey = (
  organizationId: string,
  questionId: string,
) => ["organizations", organizationId, "questions", "detail", questionId] as const;

export function useQuestionDetailQuery(
  organizationId: string | undefined,
  questionId: string | null,
) {
  return useQuery({
    queryKey: questionDetailQueryKey(organizationId ?? "", questionId ?? ""),
    queryFn: () => questionRepository.getById(organizationId!, questionId!),
    enabled: Boolean(organizationId && questionId),
  });
}
