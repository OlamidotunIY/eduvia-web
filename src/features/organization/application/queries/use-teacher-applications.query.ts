import { useQuery } from '@tanstack/react-query';
import type { TeacherApplicationStatus } from '@/shared/domain';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';

export const TEACHER_APPLICATIONS_QUERY_KEY = 'organization-applications';

export function useTeacherApplicationsQuery(
  organizationId?: string,
  status?: TeacherApplicationStatus,
) {
  return useQuery({
    queryKey: [TEACHER_APPLICATIONS_QUERY_KEY, organizationId, status ?? 'all'],
    queryFn: async () => {
      if (!organizationId) return [];
      return organizationRepository.listApplications(organizationId, status);
    },
    enabled: Boolean(organizationId),
  });
}
