import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RejectTeacherApplicationInput } from '@/shared/domain';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';
import { TEACHER_APPLICATIONS_QUERY_KEY } from '../queries/use-teacher-applications.query';

export function useRejectApplicationMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      input,
    }: {
      applicationId: string;
      input?: RejectTeacherApplicationInput;
    }) => {
      if (!organizationId) throw new Error('Missing active organization');
      return organizationRepository.rejectApplication(organizationId, applicationId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TEACHER_APPLICATIONS_QUERY_KEY, organizationId],
      });
    },
  });
}
