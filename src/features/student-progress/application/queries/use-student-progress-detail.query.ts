import { useQuery } from "@tanstack/react-query";
import { studentProgressRepository } from "../../infrastructure";
import type { StudentMasteryNode } from "@/shared/domain";

export function useStudentMasteryGraphQuery(
  studentId?: string,
  orgId?: string,
) {
  return useQuery<StudentMasteryNode[]>({
    queryKey: ["student-mastery-graph", studentId, orgId],
    queryFn: () => {
      if (!studentId) {
        throw new Error("Student ID is required");
      }
      return studentProgressRepository.getStudentMasteryGraph(studentId, orgId);
    },
    enabled: Boolean(studentId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useStudentProgressSummariesQuery(
  studentId?: string,
  orgId?: string,
  subjectId?: string,
) {
  return useQuery<any[]>({
    queryKey: ["student-progress-summaries", studentId, orgId, subjectId],
    queryFn: () => {
      if (!studentId) {
        throw new Error("Student ID is required");
      }
      return studentProgressRepository.getStudentProgress(studentId, orgId, subjectId);
    },
    enabled: Boolean(studentId),
    staleTime: 1000 * 60 * 2,
  });
}
