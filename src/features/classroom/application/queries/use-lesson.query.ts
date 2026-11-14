import { useQuery } from "@tanstack/react-query";
import { classroomRepository } from "../../infrastructure";

export const lessonDetailQueryKey = (
  organizationId: string,
  lessonId: string,
) => ["organizations", organizationId, "lessons", lessonId] as const;

export function useLessonQuery(
  organizationId: string | undefined,
  lessonId: string | undefined,
) {
  return useQuery({
    queryKey: lessonDetailQueryKey(organizationId ?? "", lessonId ?? ""),
    queryFn: () => classroomRepository.getLesson(organizationId!, lessonId!),
    enabled: Boolean(organizationId && lessonId),
  });
}
