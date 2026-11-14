import { useMutation, useQueryClient } from "@tanstack/react-query";
import { classroomRepository } from "../../infrastructure";
import { lessonDetailQueryKey } from "../queries/use-lesson.query";

function useInvalidateLessonQueries(
  organizationId: string | undefined,
  lessonId: string | undefined,
  classroomId?: string,
) {
  const queryClient = useQueryClient();
  return async () => {
    const tasks: Promise<unknown>[] = [];
    if (organizationId && lessonId) {
      tasks.push(
        queryClient.invalidateQueries({
          queryKey: lessonDetailQueryKey(organizationId, lessonId),
        }),
      );
    }
    if (organizationId) {
      tasks.push(
        queryClient.invalidateQueries({
          queryKey: ["organizations", organizationId, "calendar-lessons"],
        }),
      );
      if (classroomId) {
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: [
              "organizations",
              organizationId,
              "classrooms",
              classroomId,
              "lessons",
            ],
          }),
        );
      } else {
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: ["organizations", organizationId, "classrooms"],
          }),
        );
      }
    }
    await Promise.all(tasks);
  };
}

export function useStartLessonMutation(
  organizationId: string | undefined,
  lessonId: string | undefined,
  classroomId?: string,
) {
  const invalidate = useInvalidateLessonQueries(
    organizationId,
    lessonId,
    classroomId,
  );
  return useMutation({
    mutationFn: (targetLessonId?: string) =>
      classroomRepository.startLesson(
        organizationId!,
        targetLessonId ?? lessonId!,
      ),
    onSuccess: invalidate,
  });
}

export function useCompleteLessonMutation(
  organizationId: string | undefined,
  lessonId: string | undefined,
  classroomId?: string,
) {
  const invalidate = useInvalidateLessonQueries(
    organizationId,
    lessonId,
    classroomId,
  );
  return useMutation({
    mutationFn: (targetLessonId?: string) =>
      classroomRepository.completeLesson(
        organizationId!,
        targetLessonId ?? lessonId!,
      ),
    onSuccess: invalidate,
  });
}

export function useCancelLessonMutation(
  organizationId: string | undefined,
  lessonId: string | undefined,
  classroomId?: string,
) {
  const invalidate = useInvalidateLessonQueries(
    organizationId,
    lessonId,
    classroomId,
  );
  return useMutation({
    mutationFn: (input: { lessonId?: string; reason: string }) =>
      classroomRepository.cancelLesson(
        organizationId!,
        input.lessonId ?? lessonId!,
        input.reason,
      ),
    onSuccess: invalidate,
  });
}

export function useMarkStudentNoShowMutation(
  organizationId: string | undefined,
  lessonId: string | undefined,
  classroomId?: string,
) {
  const invalidate = useInvalidateLessonQueries(
    organizationId,
    lessonId,
    classroomId,
  );
  return useMutation({
    mutationFn: (targetLessonId?: string) =>
      classroomRepository.markStudentNoShow(
        organizationId!,
        targetLessonId ?? lessonId!,
      ),
    onSuccess: invalidate,
  });
}

export function useMarkTeacherNoShowMutation(
  organizationId: string | undefined,
  lessonId: string | undefined,
  classroomId?: string,
) {
  const invalidate = useInvalidateLessonQueries(
    organizationId,
    lessonId,
    classroomId,
  );
  return useMutation({
    mutationFn: (targetLessonId?: string) =>
      classroomRepository.markTeacherNoShow(
        organizationId!,
        targetLessonId ?? lessonId!,
      ),
    onSuccess: invalidate,
  });
}

export function useAssignCoverTeacherMutation(
  organizationId: string | undefined,
  lessonId: string | undefined,
  classroomId?: string,
) {
  const invalidate = useInvalidateLessonQueries(
    organizationId,
    lessonId,
    classroomId,
  );
  return useMutation({
    mutationFn: (coverTeacherId: string) =>
      classroomRepository.assignCoverTeacher(
        organizationId!,
        lessonId!,
        coverTeacherId,
      ),
    onSuccess: invalidate,
  });
}
