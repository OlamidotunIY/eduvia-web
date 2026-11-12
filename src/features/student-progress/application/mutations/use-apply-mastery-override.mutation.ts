import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentProgressRepository } from "../../infrastructure";

export function useApplyMasteryOverrideMutation(
  studentId: string,
  orgId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nodeId,
      score,
    }: {
      nodeId: string;
      score: number;
    }) => {
      return studentProgressRepository.applyMasteryOverride(
        studentId,
        nodeId,
        orgId,
        score,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-mastery-graph", studentId, orgId],
      });
      queryClient.invalidateQueries({
        queryKey: ["student-progress-summaries", studentId, orgId],
      });
      queryClient.invalidateQueries({
        queryKey: ["org-students-progress", orgId],
      });
    },
  });
}
