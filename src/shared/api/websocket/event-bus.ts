import type { WsEventType } from './event-types'

type EventHandler<TPayload = unknown> = (payload: TPayload) => void

class EventBus {
  private readonly listeners = new Map<WsEventType, Set<EventHandler>>()

  subscribe<TPayload>(eventType: WsEventType, handler: EventHandler<TPayload>): () => void {
    const handlers = this.listeners.get(eventType) ?? new Set<EventHandler>()
    handlers.add(handler as EventHandler)
    this.listeners.set(eventType, handlers)

    return () => handlers.delete(handler as EventHandler)
  }

  publish(eventType: WsEventType, payload: unknown): void {
    this.listeners.get(eventType)?.forEach((handler) => handler(payload))
  }
}

export const eventBus = new EventBus()
