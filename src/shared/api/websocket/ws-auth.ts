export function buildUserSocketAuth(accessToken: string): Record<string, string> {
  return { token: accessToken }
}

export function buildRegistrationSocketAuth(
  registrationRequestId: string,
  registrationContinuation: string,
): Record<string, string> {
  return { registrationRequestId, registrationContinuation }
}
