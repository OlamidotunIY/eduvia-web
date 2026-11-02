import { eventBus } from './event-bus'
import { isWsEventType } from './event-types'

/** Maps Socket.IO's named events into the application event bus. */
export function createEventRouter() {
  return (eventName: string, payload: unknown): void => {
    if (isWsEventType(eventName)) eventBus.publish(eventName, payload)
  }
}
