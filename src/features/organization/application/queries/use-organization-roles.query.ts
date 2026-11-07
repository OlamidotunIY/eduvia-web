import { useQuery } from '@tanstack/react-query'
import { organizationRepository } from '../../infrastructure/repository/organization.repository'

export const ORGANIZATION_ROLES_QUERY_KEY = 'organization-roles'

export function useOrganizationRolesQuery(organizationId?: string) {
  return useQuery({
    queryKey: [ORGANIZATION_ROLES_QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) return []
      return organizationRepository.listRoles(organizationId)
    },
    enabled: Boolean(organizationId),
  })
}
