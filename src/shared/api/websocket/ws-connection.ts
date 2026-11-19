import { io, type Socket } from 'socket.io-client'
import { WS_BASE_URL } from '@/shared/constant/api-constant'
import { createEventRouter } from './event-router'

interface ConnectInput {
  namespace: `/${string}`
  auth: object
}

interface ActiveRoomSubscription {
  joinEvent: string
  leaveEvent: string
  payload: Record<string, string>
  refs: number
}

/** Shared Socket.IO transport. Feature handlers receive events through the event bus. */
export class WsConnection {
  private socket: Socket | null = null
  private connected = false
  private readonly statusListeners = new Set<() => void>()
  private readonly activeRooms = new Map<string, ActiveRoomSubscription>()

  public onEvent: (eventName: string, payload: unknown) => void = createEventRouter()

  connect({ namespace, auth }: ConnectInput): void {
    this.disconnectSocket()

    const socket = io(`${WS_BASE_URL}${namespace}`, {
      auth,
      transports: ['websocket'],
    })

    this.socket = socket

    socket.on('connect', () => {
      this.setConnected(true)
      for (const room of this.activeRooms.values()) {
        socket.emit(room.joinEvent, room.payload)
      }
    })

    socket.on('disconnect', () => {
      this.setConnected(false)
    })

    socket.onAny((eventName: string, payload: unknown) => {
      this.onEvent(eventName, payload)
    })
  }

  disconnect(): void {
    this.activeRooms.clear()
    this.disconnectSocket()
  }

  emit(eventName: string, payload?: unknown): void {
    if (!this.socket?.connected) return
    this.socket.emit(eventName, payload)
  }

  joinRoom(
    joinEvent: string,
    leaveEvent: string,
    payload: Record<string, string>,
  ): () => void {
    const key = `${joinEvent}:${JSON.stringify(payload)}`
    const existing = this.activeRooms.get(key)

    if (existing) {
      existing.refs += 1
    } else {
      this.activeRooms.set(key, { joinEvent, leaveEvent, payload, refs: 1 })
      if (this.socket?.connected) {
        this.socket.emit(joinEvent, payload)
      }
    }

    let cleaned = false
    return () => {
      if (cleaned) return
      cleaned = true
      const current = this.activeRooms.get(key)
      if (!current) return
      current.refs -= 1
      if (current.refs <= 0) {
        this.activeRooms.delete(key)
        if (this.socket?.connected) {
          this.socket.emit(leaveEvent, payload)
        }
      }
    }
  }

  isConnected = (): boolean => this.connected

  subscribeStatus = (listener: () => void): (() => void) => {
    this.statusListeners.add(listener)
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  private setConnected(next: boolean): void {
    if (this.connected === next) return
    this.connected = next
    this.statusListeners.forEach((listener) => listener())
  }

  private disconnectSocket(): void {
    this.socket?.disconnect()
    this.socket = null
    this.setConnected(false)
  }
}

export const userWsConnection = new WsConnection()
export const notificationsWsConnection = new WsConnection()
export const chatWsConnection = new WsConnection()
export const lessonWsConnection = new WsConnection()
export const boardWsConnection = new WsConnection()
export const registrationWsConnection = new WsConnection()
