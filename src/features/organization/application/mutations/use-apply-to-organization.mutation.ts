import { useMutation } from '@tanstack/react-query'
import { organizationRepository } from '../../infrastructure'

export function useApplyToOrganizationMutation() {
  return useMutation({ mutationFn: (organizationId: string) => organizationRepository.apply(organizationId) })
}
