import { eventBus } from '../event-bus'
import type { WsEventType } from '../event-types'

export abstract class WsEventHandler<TPayload> {
  abstract readonly eventType: WsEventType

  register(): () => void {
    return eventBus.subscribe<TPayload>(this.eventType, this.handle.bind(this))
  }

  abstract handle(payload: TPayload): void
}
