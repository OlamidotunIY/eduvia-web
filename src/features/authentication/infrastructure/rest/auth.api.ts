import { apiClient } from '@/shared/api';
import type {
  LoginDto,
  RegisterEmailDto,
  VerifyOtpDto,
  RefreshTokenDto,
} from '@/shared/api/generated';

export const authApi = {
  login: (body: LoginDto) =>
    apiClient.post<unknown>('/auth/login', body).then((response) => response.data),

  startEmailRegistration: (body: RegisterEmailDto) =>
    apiClient.post<unknown>('/auth/register/email', body).then((response) => response.data),

  getRegistrationStatus: (registrationRequestId: string, registrationContinuation: string) =>
    apiClient
      .get<unknown>(`/auth/registrations/${registrationRequestId}`, {
        params: { continuation: registrationContinuation },
      })
      .then((response) => response.data),

  verifyEmail: (body: VerifyOtpDto) =>
    apiClient.post<unknown>('/auth/verify-otp', body).then((response) => response.data),

  resendVerification: (email: string) =>
    apiClient.post('/auth/resend-otp', { email }).then(() => undefined),

  exchangeGoogle: (code: string) =>
    apiClient.post<unknown>('/auth/google/exchange', { code }).then((response) => response.data),

  refresh: (body: RefreshTokenDto) =>
    apiClient.post<unknown>('/auth/refresh', body).then((response) => response.data),

  logout: () => apiClient.post('/logout').then(() => undefined),

  getMe: () => apiClient.get<unknown>('/me').then((response) => response.data),
};
