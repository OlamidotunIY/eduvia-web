import { useQuery } from "@tanstack/react-query";
import {
  lessonReportsRepository,
  type MissingReportLessonsFilter,
} from "../../infrastructure";
import type { MissingReportLessonItem } from "@/shared/domain";

export function useMissingReportLessonsQuery(
  orgId?: string,
  filter?: MissingReportLessonsFilter,
) {
  return useQuery<MissingReportLessonItem[]>({
    queryKey: ["missing-report-lessons", orgId, filter],
    queryFn: () => {
      if (!orgId) {
        throw new Error("Organization ID is required");
      }
      return lessonReportsRepository.getMissingReportLessons(orgId, filter);
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 2,
  });
}
