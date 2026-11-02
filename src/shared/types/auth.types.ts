export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface SessionTokenPayload extends TokenPair {
  sessionId: string
  accessTokenExpiresAt: string | Date
  refreshTokenExpiresAt: string | Date
}

export type AuthScope = 'onboarding' | 'user'
