import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { OrganizationSubjectUpdateInput } from "@/shared/domain";
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
      input: OrganizationSubjectUpdateInput;
    }) => subjectRepository.update(organizationId!, subjectId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: organizationSubjectsKey(organizationId ?? ""),
      }),
  });
}
