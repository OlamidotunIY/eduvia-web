import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateSubjectDto } from "@/shared/api/generated";
import { subjectRepository } from "../../infrastructure";
import { organizationSubjectsKey } from "../queries/use-subjects.query";

export function useUpdateSubjectMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
      input,
    }: {
      subjectId: string;
      input: UpdateSubjectDto;
    }) => subjectRepository.update(organizationId!, subjectId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: organizationSubjectsKey(organizationId ?? ""),
      }),
  });
}
