import { useMutation } from '@tanstack/react-query'
import { organizationRepository } from '../../infrastructure'

export function useSwitchOrganizationMutation() {
  return useMutation({ mutationFn: (organizationId: string) => organizationRepository.selectActive(organizationId) })
}
