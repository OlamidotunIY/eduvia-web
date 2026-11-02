import { io, type Socket } from 'socket.io-client'
import { WS_BASE_URL } from '@/shared/constant/api-constant'
import { createEventRouter } from './event-router'

interface ConnectInput {
  namespace: `/${string}`
  auth: object
}

/** Shared Socket.IO transport. Domain code receives events through the event bus. */
export class WsConnection {
  private socket: Socket | null = null
  public onEvent: (eventName: string, payload: unknown) => void = createEventRouter()

  connect({ namespace, auth }: ConnectInput): void {
    this.disconnect()
    this.socket = io(`${WS_BASE_URL}${namespace}`, {
      auth,
      transports: ['websocket'],
    })
    this.socket.onAny((eventName: string, payload: unknown) => {
      this.onEvent(eventName, payload)
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }
}

export const userWsConnection = new WsConnection()
