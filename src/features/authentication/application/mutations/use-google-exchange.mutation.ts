import { useMutation } from '@tanstack/react-query'
import { authRepository } from '../../infrastructure'

export function useGoogleExchangeMutation() {
  return useMutation({
    mutationFn: (code: string) => authRepository.exchangeGoogle(code),
  })
}
