import { useMutation } from '@tanstack/react-query'
import type { CompleteOnboardingInput } from '@/shared/domain'
import { onboardingRepository } from '../../infrastructure'

export function useCompleteOnboardingMutation() {
  return useMutation({
    mutationFn: (input: CompleteOnboardingInput) => onboardingRepository.complete(input),
  })
}
