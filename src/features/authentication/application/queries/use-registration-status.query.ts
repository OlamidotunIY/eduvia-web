import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  eventBus,
  WsConnection,
  WsEventType,
  type RegistrationReadyPayload,
} from '@/shared/api'
import { authRepository } from '../../infrastructure'

/**
 * Registration completion is delivered by a continuation-authenticated socket.
 * The HTTP read only exchanges the ready event for its one-time session payload.
 */
export function useRegistrationStatusQuery(
  registrationRequestId: string | null,
  registrationContinuation: string | null,
) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(false)
    if (!registrationRequestId || !registrationContinuation) return

    const connection = new WsConnection()
    const unregister = eventBus.subscribe<RegistrationReadyPayload>(
      WsEventType.REGISTRATION_READY,
      (payload) => {
        if (payload.registrationRequestId === registrationRequestId) setIsReady(true)
      },
    )
    connection.connect({
      namespace: '/registration',
      auth: { registrationRequestId, registrationContinuation },
    })

    return () => {
      unregister()
      connection.disconnect()
    }
  }, [registrationContinuation, registrationRequestId])

  const query = useQuery({
    queryKey: ['authentication', 'registration', registrationRequestId],
    queryFn: () => authRepository.getRegistrationStatus(registrationRequestId!, registrationContinuation!),
    enabled: Boolean(registrationRequestId && registrationContinuation && isReady),
    staleTime: 0,
  })

  return { ...query, isAwaitingCompletion: Boolean(registrationRequestId && registrationContinuation && !isReady) }
}
