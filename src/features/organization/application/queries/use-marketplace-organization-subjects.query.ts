import { useQuery } from '@tanstack/react-query';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';

export const MARKETPLACE_ORG_SUBJECTS_QUERY_KEY = 'marketplace-organization-subjects';

export function useMarketplaceOrganizationSubjectsQuery(
  organizationId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [MARKETPLACE_ORG_SUBJECTS_QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return organizationRepository.listMarketplaceOrganizationSubjects(organizationId);
    },
    enabled: Boolean(organizationId) && enabled,
  });
}
