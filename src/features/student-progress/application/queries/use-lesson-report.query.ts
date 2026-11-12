import { useQuery } from "@tanstack/react-query";
import { studentProgressRepository } from "../../infrastructure";
import type { LessonReportDetail } from "@/shared/domain";

export function useLessonReportQuery(
  orgId?: string,
  reportId?: string | null,
) {
  return useQuery<LessonReportDetail>({
    queryKey: ["lesson-report-detail", orgId, reportId],
    queryFn: () => {
      if (!orgId || !reportId) {
        throw new Error("Org ID and Report ID are required");
      }
      return studentProgressRepository.getLessonReport(orgId, reportId);
    },
    enabled: Boolean(orgId && reportId),
    staleTime: 1000 * 60 * 2,
  });
}
