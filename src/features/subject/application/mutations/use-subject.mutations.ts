import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { OrganizationSubjectInput } from "@/shared/domain";
import { subjectRepository } from "../../infrastructure";
import { organizationSubjectsKey } from "../queries/use-subjects.query";

export function useCreateSubjectMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrganizationSubjectInput) =>
      subjectRepository.create(organizationId!, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: organizationSubjectsKey(organizationId ?? ""),
      }),
  });
}

export function useUpdateSubjectMutation(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
      input,
    }: {
      subjectId: string;
      input: OrganizationSubjectInput;
    }) => subjectRepository.update(organizationId!, subjectId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: organizationSubjectsKey(organizationId ?? ""),
      }),
  });
}
