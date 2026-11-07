import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChangeMemberRoleDto } from '@/shared/api/generated';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';
import { ORGANIZATION_MEMBERS_QUERY_KEY } from '../queries/use-organization-members.query';

export function useChangeMemberRoleMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      input,
    }: {
      userId: string;
      input: ChangeMemberRoleDto;
    }) => {
      if (!organizationId) throw new Error('Missing active organization');
      return organizationRepository.changeMemberRole(organizationId, userId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY, organizationId],
      });
    },
  });
}
