import { useQuery } from "@tanstack/react-query";
import { curriculumRepository } from "../../infrastructure";

export const curriculumOverviewQueryKey = (organizationId: string) =>
  ["organizations", organizationId, "curriculum", "overview"] as const;

export const curriculumTreeQueryKey = (
  organizationId: string,
  curriculumId: string,
) =>
  [
    "organizations",
    organizationId,
    "curriculum",
    "tree",
    curriculumId,
  ] as const;

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

export function useCurriculumOverviewQuery(organizationId?: string) {
  return useQuery({
    queryKey: curriculumOverviewQueryKey(organizationId ?? ""),
    queryFn: () => curriculumRepository.getOverview(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function useCurriculumTreeQuery(
  organizationId?: string,
  curriculumId?: string,
) {
  return useQuery({
    queryKey: organizationId
      ? curriculumTreeQueryKey(
          organizationId,
          curriculumId ?? "",
        )
      : (["organizations", "missing", "curriculum", "tree"] as const),
    queryFn: () => {
      if (!organizationId || !curriculumId) {
        throw new Error("An active organization and curriculum are required.");
      }
      return curriculumRepository.getTree(organizationId, curriculumId);
    },
    enabled: Boolean(organizationId && curriculumId),
  });
}

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
    enabled: Boolean(organizationId && trimmed.length >= 2),
  });
}
