import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SendInvitationInput } from '../../domain'
import { organizationRepository } from '../../infrastructure/repository/organization.repository'
import { ORGANIZATION_MEMBERS_QUERY_KEY } from '../queries/use-organization-members.query'

export function useInviteMemberMutation(organizationId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SendInvitationInput) => {
      if (!organizationId) throw new Error('Missing active organization')
      return organizationRepository.inviteMember(organizationId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY, organizationId],
      })
    },
  })
}
