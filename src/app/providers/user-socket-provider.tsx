import { useEffect, type ReactNode } from 'react'
import { activeOrganizationChangedHandler } from '@/features/authentication'
import {
  boardCanvasClearedHandler,
  boardCanvasReplacedHandler,
  boardLockChangedHandler,
  boardModeChangedHandler,
  boardSectionAddedHandler,
  boardSectionRemovedHandler,
  boardSectionUpdatedHandler,
  boardStrokeDrawnHandler,
  boardSurfaceChangedHandler,
  lessonMeetLinkReadyHandler,
  lessonStatusChangedHandler,
} from '@/features/classroom'
import {
  chatDirectMessageHandler,
  chatNewMessageHandler,
  chatUserTypingHandler,
} from '@/features/messages'
import {
  notificationCountHandler,
  notificationMarkedReadHandler,
  notificationNewHandler,
} from '@/features/notifications'
import {
  boardWsConnection,
  buildUserSocketAuth,
  chatWsConnection,
  lessonWsConnection,
  notificationsWsConnection,
  userWsConnection,
} from '@/shared/api'
import { authStore } from '@/shared/store'

interface UserSocketProviderProps {
  children: ReactNode
}

const REGISTERED_HANDLERS = [
  activeOrganizationChangedHandler,
  notificationNewHandler,
  notificationCountHandler,
  notificationMarkedReadHandler,
  chatNewMessageHandler,
  chatDirectMessageHandler,
  chatUserTypingHandler,
  lessonStatusChangedHandler,
  lessonMeetLinkReadyHandler,
  boardModeChangedHandler,
  boardLockChangedHandler,
  boardSectionAddedHandler,
  boardSectionUpdatedHandler,
  boardSectionRemovedHandler,
  boardStrokeDrawnHandler,
  boardCanvasReplacedHandler,
  boardCanvasClearedHandler,
  boardSurfaceChangedHandler,
] as const

/** Starts and stops the authenticated shared websocket transport and registers all feature handlers. */
export function UserSocketProvider({ children }: UserSocketProviderProps) {
  const accessToken = authStore((state) => state.accessToken)
  const isHydrated = authStore((state) => state.isHydrated)

  useEffect(() => {
    if (!isHydrated || !accessToken) return

    const unregisters = REGISTERED_HANDLERS.map((handler) => handler.register())
    const auth = buildUserSocketAuth(accessToken)

    userWsConnection.connect({ namespace: '/user', auth })
    notificationsWsConnection.connect({ namespace: '/notifications', auth })
    chatWsConnection.connect({ namespace: '/chat', auth })
    lessonWsConnection.connect({ namespace: '/lesson', auth })
    boardWsConnection.connect({ namespace: '/board', auth })

    return () => {
      unregisters.forEach((unregister) => unregister())
      userWsConnection.disconnect()
      notificationsWsConnection.disconnect()
      chatWsConnection.disconnect()
      lessonWsConnection.disconnect()
      boardWsConnection.disconnect()
    }
  }, [accessToken, isHydrated])

  return <>{children}</>
}
