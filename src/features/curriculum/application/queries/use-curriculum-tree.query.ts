import { useQuery } from "@tanstack/react-query";
import { curriculumRepository } from "../../infrastructure";

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
