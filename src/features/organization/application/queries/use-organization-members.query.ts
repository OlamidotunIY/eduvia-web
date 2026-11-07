import { useQuery } from '@tanstack/react-query'
import { organizationRepository } from '../../infrastructure/repository/organization.repository'

export const ORGANIZATION_MEMBERS_QUERY_KEY = 'organization-members'
export const ORGANIZATION_ROLES_QUERY_KEY = 'organization-roles'

export function useOrganizationMembersQuery(organizationId?: string) {
  return useQuery({
    queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) return []
      return organizationRepository.listMembers(organizationId)
    },
    enabled: Boolean(organizationId),
  })
}

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
