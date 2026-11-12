import { useQuery } from "@tanstack/react-query";
import { studentProgressRepository, type OrgProgressFilter } from "../../infrastructure";
import type { OrgStudentsProgressResponse } from "@/shared/domain";

export function useOrgStudentsProgressQuery(
  orgId?: string,
  filter?: OrgProgressFilter,
) {
  return useQuery<OrgStudentsProgressResponse>({
    queryKey: ["org-students-progress", orgId, filter],
    queryFn: () => {
      if (!orgId) {
        throw new Error("Organization ID is required");
      }
      return studentProgressRepository.getOrgStudentsProgress(orgId, filter);
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 2,
  });
}
