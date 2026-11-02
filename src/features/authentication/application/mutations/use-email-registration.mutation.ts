import { useMutation } from '@tanstack/react-query'
import type { EmailRegistration } from '@/shared/domain'
import { authRepository } from '../../infrastructure'

export function useEmailRegistrationMutation() {
  return useMutation({
    mutationFn: (input: EmailRegistration) => authRepository.startEmailRegistration(input),
  })
}
