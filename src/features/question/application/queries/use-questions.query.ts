import { useQuery } from "@tanstack/react-query";
import type { QuestionFilter } from "@/shared/domain";
import { questionRepository } from "../../infrastructure";

export const questionsQueryKey = (
  organizationId: string,
  filter?: QuestionFilter,
) => ["organizations", organizationId, "questions", filter ?? {}] as const;

export function useQuestionsQuery(
  organizationId: string | undefined,
  filter?: QuestionFilter,
) {
  return useQuery({
    queryKey: questionsQueryKey(organizationId ?? "", filter),
    queryFn: () => questionRepository.search(organizationId!, filter),
    enabled: Boolean(organizationId),
  });
}
