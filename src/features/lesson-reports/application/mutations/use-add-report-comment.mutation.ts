import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonReportsRepository } from "../../infrastructure";

export function useAddLessonReportCommentMutation(
  orgId: string,
  reportId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      parentCommentId,
    }: {
      content: string;
      parentCommentId?: string;
    }) =>
      lessonReportsRepository.addComment(
        orgId,
        reportId,
        content,
        parentCommentId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-report-detail", orgId, reportId],
      });
      queryClient.invalidateQueries({ queryKey: ["org-reports", orgId] });
      queryClient.invalidateQueries({ queryKey: ["student-lesson-history"] });
    },
  });
}
