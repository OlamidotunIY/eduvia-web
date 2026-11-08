import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateOrganizationRoleDto } from '@/shared/api/generated';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';
import { ORGANIZATION_ROLES_QUERY_KEY } from '../queries/use-organization-roles.query';

export function useCreateRoleMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrganizationRoleDto) => {
      if (!organizationId) throw new Error('Organization ID is missing');
      return organizationRepository.createRole(organizationId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_ROLES_QUERY_KEY, organizationId],
      });
    },
  });
}
