import { io, type Socket } from 'socket.io-client'
import { WS_BASE_URL } from '@/shared/constant/api-constant'
import { eventBus } from './event-bus'
import { WsEventType, type WsEventType as WsEventTypeValue } from './event-types'

interface ConnectInput {
  namespace: '/user' | '/registration'
  auth: Record<string, string>
}

/** Shared Socket.IO transport. Domain code receives events through the event bus. */
export class WsConnection {
  private socket: Socket | null = null

  connect({ namespace, auth }: ConnectInput): void {
    this.disconnect()
    this.socket = io(`${WS_BASE_URL}${namespace}`, {
      auth,
      transports: ['websocket'],
    })
    this.socket.onAny((eventName: string, payload: unknown) => {
      if (Object.values(WsEventType).includes(eventName as WsEventTypeValue)) {
        eventBus.publish(eventName as WsEventTypeValue, payload)
      }
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }
}

export const userWsConnection = new WsConnection()
