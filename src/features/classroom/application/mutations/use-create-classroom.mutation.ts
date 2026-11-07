import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateClassroomDto } from "@/shared/api/generated";
import { classroomRepository } from "../../infrastructure";
import { classroomsQueryKey } from "../queries/use-classrooms.query";

export function useCreateClassroomMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClassroomDto) =>
      classroomRepository.create(organizationId!, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: classroomsQueryKey(organizationId ?? ""),
      }),
  });
}
