export const WsEventType = {
  USER_ACTIVE_ORGANIZATION_CHANGED: 'user:active_organization_changed',
  REGISTRATION_READY: 'registration:ready',
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
