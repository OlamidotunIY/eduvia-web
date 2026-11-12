import { useQuery } from "@tanstack/react-query";
import { studentProgressRepository } from "../../infrastructure";
import type { LessonReportDetail } from "@/shared/domain";

export function useStudentLessonHistoryQuery(
  studentId?: string,
  orgId?: string,
  pagination?: { skip?: number; take?: number },
) {
  return useQuery<LessonReportDetail[]>({
    queryKey: ["student-lesson-history", studentId, orgId, pagination],
    queryFn: () => {
      if (!studentId) {
        throw new Error("Student ID is required");
      }
      return studentProgressRepository.getStudentLessonHistory(studentId, orgId, pagination);
    },
    enabled: Boolean(studentId),
    staleTime: 1000 * 60 * 2,
  });
}
