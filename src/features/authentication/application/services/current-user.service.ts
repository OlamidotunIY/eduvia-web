import type { CurrentUserBootstrap } from '@/shared/domain'
import { queryClient } from '@/shared/api'
import { sessionStore } from '@/shared/store'
import { authRepository } from '../../infrastructure'
import { currentUserQueryKey } from '../queries/use-me.query'

/** Refreshes the current-user projection used by route guards and app chrome. */
export async function refreshCurrentUser(): Promise<CurrentUserBootstrap> {
  const currentUser = await authRepository.getMe()
  sessionStore.getState().setCurrentUser(currentUser)
  queryClient.setQueryData(currentUserQueryKey, currentUser)
  return currentUser
}
