import { useMutation, useQueryClient } from "@tanstack/react-query";
import { classroomRepository } from "../../infrastructure";
import {
  classroomLessonsQueryKey,
  classroomStudentsQueryKey,
} from "../queries/use-classrooms.query";

export function useScheduleLessonMutation(
  organizationId: string | undefined,
  classroomId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      scheduledAt: string;
      durationMins: number;
      teacherId: string;
      isRecurring: boolean;
    }) =>
      classroomRepository.scheduleLesson(organizationId!, classroomId!, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: classroomLessonsQueryKey(
          organizationId ?? "",
          classroomId ?? "",
        ),
      }),
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
