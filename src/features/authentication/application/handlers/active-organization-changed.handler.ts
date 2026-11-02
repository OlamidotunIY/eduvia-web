import { WsEventHandler, WsEventType, type ActiveOrganizationChangedPayload } from '@/shared/api/websocket'
import { refreshCurrentUser } from '../services/current-user.service'

/** Refreshes the authenticated user's projection after the organization worker finishes. */
class ActiveOrganizationChangedHandler extends WsEventHandler<ActiveOrganizationChangedPayload> {
  readonly eventType = WsEventType.USER_ACTIVE_ORGANIZATION_CHANGED

  handle(): void {
    void refreshCurrentUser()
  }
}

export const activeOrganizationChangedHandler = new ActiveOrganizationChangedHandler()
