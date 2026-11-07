import { useQuery } from "@tanstack/react-query";
import { curriculumRepository } from "../../infrastructure";

export const curriculumSearchQueryKey = (
  organizationId: string,
  query: string,
  curriculumId?: string,
) =>
  [
    "organizations",
    organizationId,
    "curriculum",
    "search",
    curriculumId ?? "all",
    query,
  ] as const;

export function useCurriculumSearchQuery(
  organizationId?: string,
  query?: string,
  curriculumId?: string,
) {
  const trimmed = query?.trim() ?? "";
  return useQuery({
    queryKey: curriculumSearchQueryKey(organizationId ?? "", trimmed, curriculumId),
    queryFn: () =>
      curriculumRepository.search(organizationId!, trimmed, curriculumId),
    enabled: Boolean(organizationId && trimmed.length > 0),
  });
}
