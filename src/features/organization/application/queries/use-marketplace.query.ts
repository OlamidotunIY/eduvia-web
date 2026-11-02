import { useQuery } from '@tanstack/react-query'
import { organizationRepository } from '../../infrastructure'

export const marketplaceOrganizationsQueryKey = ['organizations', 'marketplace'] as const

export function useMarketplaceOrganizationsQuery() {
  return useQuery({
    queryKey: marketplaceOrganizationsQueryKey,
    queryFn: () => organizationRepository.listMarketplace(),
  })
}
