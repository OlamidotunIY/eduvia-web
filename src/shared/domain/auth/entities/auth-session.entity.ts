export interface AuthSessionProps {
  sessionId: string
  accessToken: string
  accessTokenExpiresAt: number
  refreshToken: string
  refreshTokenExpiresAt: number
}

export class AuthSession {
  readonly props: AuthSessionProps

  private constructor(props: AuthSessionProps) {
    this.props = props
  }

  static fromApi(payload: Record<string, unknown>): AuthSession {
    const sessionId = readString(payload, 'sessionId')
    const accessToken = readString(payload, 'accessToken')
    const refreshToken = readString(payload, 'refreshToken')

    return new AuthSession({
      sessionId,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: readEpoch(payload, 'accessTokenExpiresAt'),
      refreshTokenExpiresAt: readEpoch(payload, 'refreshTokenExpiresAt'),
    })
  }
}

function readString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Authentication response is missing ${key}.`)
  }
  return value
}

function readEpoch(payload: Record<string, unknown>, key: string): number {
  const value = payload[key]
  const epoch = typeof value === 'number' ? value : Date.parse(String(value))
  if (!Number.isFinite(epoch)) {
    throw new Error(`Authentication response contains an invalid ${key}.`)
  }
  return epoch < 10_000_000_000 ? epoch * 1_000 : epoch
}
