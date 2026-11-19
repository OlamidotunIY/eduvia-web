import type { BoardCanvasStroke, BoardSurfaceStyle } from '@/shared/domain'

export const WsEventType = {
  // User namespace (/user)
  USER_ACTIVE_ORGANIZATION_CHANGED: 'user:active_organization_changed',

  // Registration namespace (/registration)
  REGISTRATION_READY: 'registration:ready',

  // Notifications namespace (/notifications)
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_COUNT: 'notification:count',
  NOTIFICATION_MARKED_READ: 'notification:marked_read',

  // Chat / Messages namespace (/chat)
  CHAT_NEW_MESSAGE: 'chat:new_message',
  CHAT_DIRECT_MESSAGE: 'chat:direct_message',
  CHAT_USER_TYPING: 'chat:user_typing',

  // Lesson namespace (/lesson)
  LESSON_STATUS_CHANGED: 'lesson:status_changed',
  LESSON_MEET_LINK_READY: 'lesson:meet_link_ready',
  LESSON_PARTICIPANT_JOINED: 'lesson:participant_joined',
  LESSON_PARTICIPANT_LEFT: 'lesson:participant_left',

  // Board namespace (/board)
  BOARD_MODE_CHANGED: 'board:mode_changed',
  BOARD_LOCK_CHANGED: 'board:lock_changed',
  BOARD_SECTION_ADDED: 'board:section_added',
  BOARD_SECTION_UPDATED: 'board:section_updated',
  BOARD_SECTION_REMOVED: 'board:section_removed',
  BOARD_STROKE_DRAWN: 'board:stroke_drawn',
  BOARD_CANVAS_REPLACED: 'board:canvas_replaced',
  BOARD_CANVAS_CLEARED: 'board:canvas_cleared',
  BOARD_SURFACE_CHANGED: 'board:surface_changed',
  BOARD_USER_JOINED: 'board:user_joined',
  BOARD_USER_LEFT: 'board:user_left',
  CURSOR_MOVED: 'cursor:moved',
} as const

export type WsEventType = (typeof WsEventType)[keyof typeof WsEventType]

export function isWsEventType(value: string): value is WsEventType {
  return Object.values(WsEventType).includes(value as WsEventType)
}

export interface ActiveOrganizationChangedPayload {
  organizationId: string
}

export interface RegistrationReadyPayload {
  registrationRequestId: string
}

export interface NotificationNewPayload {
  id: string
  recipientId?: string
  type: string
  title: string
  body: string
  channel?: string
  data?: Record<string, unknown>
  createdAt?: string
}

export interface NotificationCountPayload {
  unreadCount: number
}

export interface NotificationMarkedReadPayload {
  notificationId?: string
  readAt: string
}

export interface ChatNewMessagePayload {
  id?: string
  messageId?: string
  conversationId: string
  senderId?: string
  content?: string
  text?: string
  attachmentUrl?: string | null
  sentAt?: string
}

export interface ChatDirectMessagePayload {
  id?: string
  messageId?: string
  conversationId?: string
  senderId?: string
  content?: string
  text?: string
  attachmentUrl?: string | null
  sentAt?: string
}

export interface ChatUserTypingPayload {
  conversationId: string
  userId: string
  isTyping: boolean
}

export interface LessonStatusChangedPayload {
  lessonId: string
  status: string
  updatedAt: string
}

export interface LessonMeetLinkReadyPayload {
  lessonId: string
  meetLink: string
}

export interface LessonParticipantPayload {
  lessonId: string
  userId: string
  joinedAt?: string
  leftAt?: string
}

export interface BoardModeChangedPayload {
  boardId: string
  mode: string
  updatedAt: string
}

export interface BoardLockChangedPayload {
  boardId: string
  isLocked: boolean
  updatedAt: string
}

export interface BoardSectionChangedPayload {
  boardId: string
  section: unknown
}

export interface BoardSectionRemovedPayload {
  boardId: string
  sectionId: string
}

export interface BoardStrokeDrawnPayload {
  boardId: string
  userId?: string
  stroke?: BoardCanvasStroke
  timestamp?: number
}

export interface BoardCanvasReplacedPayload {
  boardId: string
  userId?: string
  strokes?: BoardCanvasStroke[]
  timestamp?: number
}

export interface BoardCanvasClearedPayload {
  boardId: string
  userId?: string
  timestamp?: number
}

export interface BoardSurfaceChangedPayload {
  boardId: string
  userId?: string
  surfaceStyle?: BoardSurfaceStyle
  timestamp?: number
}

export interface BoardUserPresencePayload {
  boardId: string
  userId: string
  userType?: string
  joinedAt?: string
  leftAt?: string
}

export interface CursorMovedPayload {
  userId: string
  x: number
  y: number
  timestamp: number
}
