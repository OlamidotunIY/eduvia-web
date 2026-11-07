import { useMutation } from '@tanstack/react-query';
import type { CreateOrganizationDto } from '@/shared/api/generated';
import { organizationRepository } from '../../infrastructure';

export function useCreateOrganizationMutation() {
  return useMutation({ mutationFn: (input: CreateOrganizationDto) => organizationRepository.create(input) });
}
