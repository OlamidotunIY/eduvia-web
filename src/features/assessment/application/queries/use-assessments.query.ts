import { useQuery } from "@tanstack/react-query";
import type { AssessmentFilter } from "@/shared/domain";
import { assessmentRepository } from "../../infrastructure";

export const assessmentsQueryKey = (
  organizationId: string,
  filter?: AssessmentFilter,
) => ["organizations", organizationId, "assessments", filter ?? {}] as const;

export function useAssessmentsQuery(
  organizationId: string | undefined,
  filter?: AssessmentFilter,
) {
  return useQuery({
    queryKey: assessmentsQueryKey(organizationId ?? "", filter),
    queryFn: () => assessmentRepository.list(organizationId!, filter),
    enabled: Boolean(organizationId),
  });
}
