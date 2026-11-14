import { useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationRepository } from '../../infrastructure/repository/organization.repository';
import { TEACHER_APPLICATION_SETTINGS_QUERY_KEY } from '../queries/use-teacher-application-settings.query';

export function useUpdateApplicationSettingsMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      acceptingTeachers?: boolean;
      marketplaceListed?: boolean;
    }) => {
      if (!organizationId) throw new Error('Missing active organization');
      return organizationRepository.updateApplicationSettings(organizationId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TEACHER_APPLICATION_SETTINGS_QUERY_KEY, organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['marketplace', 'organizations'],
      });
    },
  });
}
