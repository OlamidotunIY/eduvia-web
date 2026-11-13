import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonReportsRepository } from "../../infrastructure";

export function useSubmitReportMutation(orgId: string, reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => lessonReportsRepository.submitReport(orgId, reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-report-detail", orgId, reportId],
      });
      queryClient.invalidateQueries({ queryKey: ["org-reports", orgId] });
      queryClient.invalidateQueries({ queryKey: ["student-lesson-history"] });
      queryClient.invalidateQueries({ queryKey: ["org-students-progress", orgId] });
    },
  });
}
