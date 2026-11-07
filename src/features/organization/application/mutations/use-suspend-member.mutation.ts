import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationRepository } from '../../infrastructure/repository/organization.repository'
import { ORGANIZATION_MEMBERS_QUERY_KEY } from '../queries/use-organization-members.query'

export function useSuspendMemberMutation(organizationId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!organizationId) throw new Error('Missing active organization')
      return organizationRepository.suspendMember(organizationId, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY, organizationId],
      })
    },
  })
}
