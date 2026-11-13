import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonReportsRepository } from "../../infrastructure";
import type { UpdateLessonReportPayload } from "@/shared/domain";

export function useUpdateReportMutation(orgId: string, reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLessonReportPayload) =>
      lessonReportsRepository.updateReport(orgId, reportId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-report-detail", orgId, reportId],
      });
      queryClient.invalidateQueries({ queryKey: ["org-reports", orgId] });
      queryClient.invalidateQueries({ queryKey: ["student-lesson-history"] });
    },
  });
}
