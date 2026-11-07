import { useQuery } from "@tanstack/react-query";
import type { AssessmentFilter } from "@/shared/domain";
import { assessmentRepository } from "../../infrastructure";

export const assessmentSummaryQueryKey = (
  organizationId: string,
  filter?: AssessmentFilter,
) =>
  ["organizations", organizationId, "assessment-summary", filter ?? {}] as const;

export function useAssessmentSummaryQuery(
  organizationId: string | undefined,
  filter?: AssessmentFilter,
) {
  return useQuery({
    queryKey: assessmentSummaryQueryKey(organizationId ?? "", filter),
    queryFn: () => assessmentRepository.getSummary(organizationId!, filter),
    enabled: Boolean(organizationId),
  });
}
