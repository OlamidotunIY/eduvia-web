import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  buildRegistrationSocketAuth,
  registrationWsConnection,
} from '@/shared/api'
import { registrationReadyHandler } from '../handlers'
import { authRepository } from '../../infrastructure'

/**
 * Registration completion is delivered by a continuation-authenticated socket.
 * The HTTP read only exchanges the ready event for its one-time session payload.
 */
export function useRegistrationStatusQuery(
  registrationRequestId: string | null,
  registrationContinuation: string | null,
) {
  const [readyRequestId, setReadyRequestId] = useState<string | null>(null)
  const isReady = Boolean(
    registrationRequestId && readyRequestId === registrationRequestId,
  )

  useEffect(() => {
    if (!registrationRequestId || !registrationContinuation) return

    const unregisterHandler = registrationReadyHandler.register()
    const unsubscribeReady = registrationReadyHandler.onReady(
      registrationRequestId,
      () => setReadyRequestId(registrationRequestId),
    )

    registrationWsConnection.connect({
      namespace: '/registration',
      auth: buildRegistrationSocketAuth(
        registrationRequestId,
        registrationContinuation,
      ),
    })

    return () => {
      unsubscribeReady()
      unregisterHandler()
      registrationWsConnection.disconnect()
    }
  }, [registrationContinuation, registrationRequestId])

  const query = useQuery({
    queryKey: ['authentication', 'registration', registrationRequestId],
    queryFn: () =>
      authRepository.getRegistrationStatus(
        registrationRequestId!,
        registrationContinuation!,
      ),
    enabled: Boolean(registrationRequestId && registrationContinuation && isReady),
    staleTime: 0,
  })

  return {
    ...query,
    isAwaitingCompletion: Boolean(
      registrationRequestId && registrationContinuation && !isReady,
    ),
  }
}
