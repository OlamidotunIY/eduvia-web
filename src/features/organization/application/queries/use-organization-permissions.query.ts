import { useQuery } from '@tanstack/react-query';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';

export const ORGANIZATION_PERMISSIONS_QUERY_KEY = 'organization-permissions';

export function useOrganizationPermissionsQuery(organizationId?: string) {
  return useQuery({
    queryKey: [ORGANIZATION_PERMISSIONS_QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return organizationRepository.listPermissions(organizationId);
    },
    enabled: Boolean(organizationId),
  });
}
