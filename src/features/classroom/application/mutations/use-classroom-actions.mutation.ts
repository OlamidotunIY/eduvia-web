import { useMutation, useQueryClient } from "@tanstack/react-query";
import { classroomRepository } from "../../infrastructure";
import {
  classroomsQueryKey,
  classroomLessonsQueryKey,
  classroomStudentsQueryKey,
} from "../queries/use-classrooms.query";

export function usePauseClassroomMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classroomId: string) =>
      classroomRepository.pause(organizationId!, classroomId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: classroomsQueryKey(organizationId ?? ""),
      }),
  });
}

export function useCloseClassroomMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classroomId: string) =>
      classroomRepository.close(organizationId!, classroomId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: classroomsQueryKey(organizationId ?? ""),
      }),
  });
}

export function useScheduleLessonMutation(
  organizationId: string | undefined,
  classroomId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      scheduledAt: string;
      durationMins: number;
      teacherId?: string;
    }) =>
      classroomRepository.scheduleLesson(organizationId!, classroomId!, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "organizations",
          organizationId ?? "",
          "classrooms",
          classroomId ?? "",
          "lessons",
        ],
      });
      await queryClient.invalidateQueries({
        queryKey: ["organizations", organizationId ?? "", "calendar-lessons"],
      });
    },
  });
}

export function useRescheduleLessonMutation(
  organizationId: string | undefined,
  classroomId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      lessonId: string;
      scheduledAt: string;
      durationMins?: number;
    }) =>
      classroomRepository.rescheduleLesson(organizationId!, input.lessonId, {
        scheduledAt: input.scheduledAt,
        durationMins: input.durationMins,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "organizations",
          organizationId ?? "",
          "classrooms",
          classroomId ?? "",
          "lessons",
        ],
      });
      await queryClient.invalidateQueries({
        queryKey: ["organizations", organizationId ?? "", "calendar-lessons"],
      });
    },
  });
}

export function useAddLearnerMutation(
  organizationId: string | undefined,
  classroomId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) =>
      classroomRepository.addLearner(organizationId!, classroomId!, studentId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: classroomStudentsQueryKey(
          organizationId ?? "",
          classroomId ?? "",
        ),
      }),
  });
}
