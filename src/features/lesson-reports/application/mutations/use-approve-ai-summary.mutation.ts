import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonReportsRepository } from "../../infrastructure";

export function useApproveAiSummaryMutation(orgId: string, reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (editedSummary?: string) =>
      lessonReportsRepository.approveAiSummary(orgId, reportId, editedSummary),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-report-detail", orgId, reportId],
      });
      queryClient.invalidateQueries({ queryKey: ["org-reports", orgId] });
    },
  });
}
