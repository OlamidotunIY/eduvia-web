import { useQuery } from '@tanstack/react-query';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';

export const ORGANIZATION_ANALYTICS_QUERY_KEY = 'organization-analytics';

export function useOrganizationAnalyticsQuery(organizationId?: string, date?: string) {
  return useQuery({
    queryKey: [ORGANIZATION_ANALYTICS_QUERY_KEY, organizationId, date],
    queryFn: async () => {
      if (!organizationId) return null;
      return organizationRepository.getAnalytics(organizationId, date);
    },
    enabled: Boolean(organizationId),
  });
}
