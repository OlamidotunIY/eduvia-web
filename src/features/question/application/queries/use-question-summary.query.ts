import { useQuery } from "@tanstack/react-query";
import { questionRepository } from "../../infrastructure";

export const questionSummaryQueryKey = (organizationId: string) =>
  ["organizations", organizationId, "question-summary"] as const;

export function useQuestionSummaryQuery(organizationId: string | undefined) {
  return useQuery({
    queryKey: questionSummaryQueryKey(organizationId ?? ""),
    queryFn: () => questionRepository.getSummary(organizationId!),
    enabled: Boolean(organizationId),
  });
}
