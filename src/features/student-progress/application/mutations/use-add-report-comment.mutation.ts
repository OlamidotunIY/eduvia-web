import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentProgressRepository } from "../../infrastructure";

export function useAddReportCommentMutation(orgId: string, reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      parentCommentId,
    }: {
      content: string;
      parentCommentId?: string;
    }) => {
      return studentProgressRepository.addReportComment(
        orgId,
        reportId,
        content,
        parentCommentId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-report-detail", orgId, reportId],
      });
      queryClient.invalidateQueries({
        queryKey: ["student-lesson-history"],
      });
    },
  });
}
