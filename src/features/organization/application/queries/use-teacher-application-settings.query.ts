import { useQuery } from '@tanstack/react-query';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';

export const TEACHER_APPLICATION_SETTINGS_QUERY_KEY = 'organization-application-settings';

export function useTeacherApplicationSettingsQuery(organizationId?: string) {
  return useQuery({
    queryKey: [TEACHER_APPLICATION_SETTINGS_QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error('Missing organization id');
      }
      return organizationRepository.getApplicationSettings(organizationId);
    },
    enabled: Boolean(organizationId),
  });
}
