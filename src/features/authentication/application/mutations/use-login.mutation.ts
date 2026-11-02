import { useMutation } from '@tanstack/react-query'
import type { LoginCredentials } from '@/shared/domain'
import { authRepository } from '../../infrastructure'

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authRepository.login(credentials),
  })
}
