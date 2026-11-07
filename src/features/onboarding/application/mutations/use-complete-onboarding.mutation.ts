import { useMutation } from '@tanstack/react-query';
import type { CompleteUserOnboardingDto } from '@/shared/api/generated';
import { onboardingRepository } from '../../infrastructure';

export function useCompleteOnboardingMutation() {
  return useMutation({
    mutationFn: (input: CompleteUserOnboardingDto) => onboardingRepository.complete(input),
  });
}
