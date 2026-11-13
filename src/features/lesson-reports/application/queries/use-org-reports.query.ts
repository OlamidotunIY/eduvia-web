import { useQuery } from "@tanstack/react-query";
import { lessonReportsRepository, type OrgReportsFilter } from "../../infrastructure";
import type { OrgReportsResponse } from "@/shared/domain";

export function useOrgReportsQuery(
  orgId?: string,
  filter?: OrgReportsFilter,
) {
  return useQuery<OrgReportsResponse>({
    queryKey: ["org-reports", orgId, filter],
    queryFn: () => {
      if (!orgId) {
        throw new Error("Organization ID is required");
      }
      return lessonReportsRepository.getOrgReports(orgId, filter);
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 2,
  });
}
