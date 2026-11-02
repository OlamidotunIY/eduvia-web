import { useMutation } from '@tanstack/react-query'
import type { OrganizationCreation } from '@/shared/domain'
import { organizationRepository } from '../../infrastructure'

export function useCreateOrganizationMutation() {
  return useMutation({ mutationFn: (input: OrganizationCreation) => organizationRepository.create(input) })
}
