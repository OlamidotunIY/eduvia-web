import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateSubjectDto } from "@/shared/api/generated";
import { subjectRepository } from "../../infrastructure";
import { organizationSubjectsKey } from "../queries/use-subjects.query";

export function useCreateSubjectMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubjectDto) =>
      subjectRepository.create(organizationId!, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: organizationSubjectsKey(organizationId ?? ""),
      }),
  });
}
