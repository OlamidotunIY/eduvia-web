import { useMutation } from '@tanstack/react-query'
import type { VerifyEmailCode } from '@/shared/domain'
import { authRepository } from '../../infrastructure'

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (input: VerifyEmailCode) => authRepository.verifyEmail(input),
  })
}
