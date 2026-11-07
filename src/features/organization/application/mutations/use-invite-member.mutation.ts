import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SendInvitationDto } from '@/shared/api/generated';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';
import { ORGANIZATION_MEMBERS_QUERY_KEY } from '../queries/use-organization-members.query';

export function useInviteMemberMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendInvitationDto) => {
      if (!organizationId) throw new Error('Missing active organization');
      return organizationRepository.inviteMember(organizationId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY, organizationId],
      });
    },
  });
}
