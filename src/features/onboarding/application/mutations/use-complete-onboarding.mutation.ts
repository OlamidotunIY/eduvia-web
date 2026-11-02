import { useMutation } from '@tanstack/react-query'
import { onboardingApi } from '../../infrastructure/rest/onboarding.api'

export function useCompleteOnboardingMutation() {
  return useMutation({
    mutationFn: (input: { userType: 'teacher' | 'parent'; firstName: string; lastName: string; timezone: string }) => onboardingApi.complete(input),
  })
}
