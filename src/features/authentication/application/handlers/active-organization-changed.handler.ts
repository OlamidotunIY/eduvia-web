import {
  eventBus,
  WsEventType,
  type ActiveOrganizationChangedPayload,
} from '@/shared/api/websocket'
import { refreshCurrentUser } from '../services/current-user.service'

/** Refreshes the authenticated user's projection after the organization worker finishes. */
class ActiveOrganizationChangedHandler {
  register(): () => void {
    return eventBus.subscribe<ActiveOrganizationChangedPayload>(
      WsEventType.USER_ACTIVE_ORGANIZATION_CHANGED,
      () => { void refreshCurrentUser() },
    )
  }
}

export const activeOrganizationChangedHandler = new ActiveOrganizationChangedHandler()
