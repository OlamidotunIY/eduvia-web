import { useQuery } from '@tanstack/react-query'
import { authRepository } from '../../infrastructure'

export const currentUserQueryKey = ['authentication', 'me'] as const

export function useMeQuery(enabled: boolean) {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => authRepository.getMe(),
    enabled,
    staleTime: 60_000,
  })
}
