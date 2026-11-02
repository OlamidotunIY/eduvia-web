import { apiClient } from '@/shared/api'

export const authApi = {
  login: (body: { email: string; password: string }) =>
    apiClient.post<unknown>('/auth/login', body).then((response) => response.data),

  startEmailRegistration: (body: {
    email: string
    password: string
    firstName: string
    lastName: string
    timezone: string
  }) => apiClient.post<unknown>('/auth/register/email', body).then((response) => response.data),

  getRegistrationStatus: (registrationRequestId: string, registrationContinuation: string) =>
    apiClient
      .get<unknown>(`/auth/registrations/${registrationRequestId}`, {
        params: { continuation: registrationContinuation },
      })
      .then((response) => response.data),

  verifyEmail: (body: { email: string; code: string }) =>
    apiClient.post<unknown>('/auth/verify-otp', body).then((response) => response.data),

  resendVerification: (email: string) =>
    apiClient.post('/auth/resend-otp', { email }).then(() => undefined),

  exchangeGoogle: (code: string) =>
    apiClient.post<unknown>('/auth/google/exchange', { code }).then((response) => response.data),

  refresh: (body: { sessionId: string; refreshToken: string }) =>
    apiClient.post<unknown>('/auth/refresh', body).then((response) => response.data),

  logout: () => apiClient.post('/logout').then(() => undefined),

  getMe: () => apiClient.get<unknown>('/me').then((response) => response.data),
}
