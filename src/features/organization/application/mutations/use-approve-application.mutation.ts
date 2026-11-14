import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApproveTeacherApplicationInput } from '@/shared/domain';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';
import { TEACHER_APPLICATIONS_QUERY_KEY } from '../queries/use-teacher-applications.query';
import { ORGANIZATION_MEMBERS_QUERY_KEY } from '../queries/use-organization-members.query';

export function useApproveApplicationMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      input,
    }: {
      applicationId: string;
      input?: ApproveTeacherApplicationInput;
    }) => {
      if (!organizationId) throw new Error('Missing active organization');
      return organizationRepository.approveApplication(organizationId, applicationId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TEACHER_APPLICATIONS_QUERY_KEY, organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY, organizationId],
      });
    },
  });
}
