import { useQuery } from "@tanstack/react-query";
import { lessonReportsRepository } from "../../infrastructure";
import type { LessonReportDetail } from "@/shared/domain";

export function useLessonReportDetailQuery(
  orgId?: string,
  reportId?: string | null,
) {
  return useQuery<LessonReportDetail>({
    queryKey: ["lesson-report-detail", orgId, reportId],
    queryFn: () => {
      if (!orgId || !reportId) {
        throw new Error("Organization ID and Report ID are required");
      }
      return lessonReportsRepository.getReport(orgId, reportId);
    },
    enabled: Boolean(orgId && reportId),
    staleTime: 1000 * 60 * 2,
  });
}
