import { useMutation } from '@tanstack/react-query';
import type { ApplyToOrganizationInput } from '@/shared/domain';
import { organizationRepository } from '../../infrastructure';

export type ApplyToOrganizationPayload =
  | string
  | ({ organizationId: string } & ApplyToOrganizationInput);

export function useApplyToOrganizationMutation() {
  return useMutation({
    mutationFn: (payload: ApplyToOrganizationPayload) => {
      if (typeof payload === 'string') {
        return organizationRepository.apply(payload);
      }
      return organizationRepository.apply(payload.organizationId, {
        appliedSubjects: payload.appliedSubjects,
        coverLetter: payload.coverLetter,
        qualifications: payload.qualifications,
      });
    },
  });
}
