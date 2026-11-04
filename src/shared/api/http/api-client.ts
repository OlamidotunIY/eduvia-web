import { API_BASE_URL, API_TIMEOUT_MS } from '@/shared/constant/api-constant'
import axios, { type AxiosInstance } from 'axios'
import { AuthSession } from '@/shared/domain'
import { authStore, sessionStore } from '@/shared/store'
import { applyAuthInterceptor } from './interceptor/auth.interceptor'
import { applyErrorInterceptor } from './interceptor/error.interceptor'

function createBaseClient(): AxiosInstance {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
}

const refreshClient = createBaseClient()
export const apiClient = createBaseClient()

applyAuthInterceptor(apiClient, () => authStore.getState().accessToken)
applyErrorInterceptor(apiClient, {
  onTokenRefresh: refreshAuthSession,
  onSessionExpired: clearSession,
})

export async function refreshAuthSession(): Promise<string | null> {
  const { sessionId, refreshToken, refreshExpiresAt } = authStore.getState()
  if (!sessionId || !refreshToken) return null
  if (refreshExpiresAt !== null && refreshExpiresAt <= Date.now()) {
    clearSession()
    return null
  }

  try {
    const response = await refreshClient.post<unknown>('/auth/refresh', {
      sessionId,
      refreshToken,
    })
    const session = AuthSession.fromApi(asRecord(response.data))
    authStore.getState().setSession({
      accessToken: session.props.accessToken,
      refreshToken: session.props.refreshToken,
      expiresAt: session.props.accessTokenExpiresAt,
      refreshExpiresAt: session.props.refreshTokenExpiresAt,
      sessionId: session.props.sessionId,
    })
    return session.props.accessToken
  } catch {
    clearSession()
    return null
  }
}

export type ApiClient = typeof apiClient

function clearSession() {
  authStore.getState().clear()
  sessionStore.getState().clearCurrentUser()
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The API returned an invalid authentication response.')
  }
  return value as Record<string, unknown>
}
