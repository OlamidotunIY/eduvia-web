import {
  WsEventHandler,
  WsEventType,
  type RegistrationReadyPayload,
} from '@/shared/api/websocket'

/** Routes continuation-authenticated registration completion events to awaiting sign-up queries. */
class RegistrationReadyHandler extends WsEventHandler<RegistrationReadyPayload> {
  readonly eventType = WsEventType.REGISTRATION_READY
  private readonly listeners = new Map<string, Set<() => void>>()

  handle(payload: RegistrationReadyPayload): void {
    if (!payload?.registrationRequestId) return
    this.listeners.get(payload.registrationRequestId)?.forEach((listener) => listener())
  }

  onReady(registrationRequestId: string, listener: () => void): () => void {
    const requestListeners = this.listeners.get(registrationRequestId) ?? new Set()
    requestListeners.add(listener)
    this.listeners.set(registrationRequestId, requestListeners)

    return () => {
      requestListeners.delete(listener)
      if (requestListeners.size === 0) {
        this.listeners.delete(registrationRequestId)
      }
    }
  }
}

export const registrationReadyHandler = new RegistrationReadyHandler()
