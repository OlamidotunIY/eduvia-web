import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateOrganizationRoleDto } from '@/shared/api/generated';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';
import { ORGANIZATION_ROLES_QUERY_KEY } from '../queries/use-organization-roles.query';

export function useUpdateRoleMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      input,
    }: {
      roleId: string;
      input: UpdateOrganizationRoleDto;
    }) => {
      if (!organizationId) throw new Error('Organization ID is missing');
      return organizationRepository.updateRole(organizationId, roleId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_ROLES_QUERY_KEY, organizationId],
      });
    },
  });
}
