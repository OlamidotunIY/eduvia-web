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
