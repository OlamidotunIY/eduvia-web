import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonReportsRepository } from "../../infrastructure";
import type { CreateLessonReportPayload } from "@/shared/domain";

export function useCreateReportMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLessonReportPayload) =>
      lessonReportsRepository.createReport(orgId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-reports", orgId] });
      queryClient.invalidateQueries({
        queryKey: ["missing-report-lessons", orgId],
      });
    },
  });
}
