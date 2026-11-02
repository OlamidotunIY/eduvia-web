import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { WS_BASE_URL } from '@/shared/constant/api-constant'
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

    const socket = io(`${WS_BASE_URL}/registration`, {
      auth: { registrationRequestId, registrationContinuation },
      transports: ['websocket'],
    })
    socket.on('registration:ready', () => setIsReady(true))

    return () => {
      socket.disconnect()
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
