import { useQuery } from "@tanstack/react-query";
import { curriculumRepository } from "../../infrastructure";

export const curriculumOverviewQueryKey = (organizationId: string) =>
  ["organizations", organizationId, "curriculum", "overview"] as const;

export function useCurriculumOverviewQuery(organizationId?: string) {
  return useQuery({
    queryKey: curriculumOverviewQueryKey(organizationId ?? ""),
    queryFn: () => curriculumRepository.getOverview(organizationId!),
    enabled: Boolean(organizationId),
  });
}
