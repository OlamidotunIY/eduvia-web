import type { RegistrationSocketAuthPayload, SocketAuthPayload } from '@/shared/types'

export function buildUserSocketAuth(accessToken: string): SocketAuthPayload {
  return { token: accessToken }
}

export function buildRegistrationSocketAuth(
  registrationRequestId: string,
  registrationContinuation: string,
): RegistrationSocketAuthPayload {
  return { registrationRequestId, registrationContinuation }
}
