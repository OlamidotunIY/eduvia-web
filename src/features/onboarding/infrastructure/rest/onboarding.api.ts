import { apiClient } from '@/shared/api'
import type { EduviaRole } from '@/shared/domain'

export const onboardingApi = {
  complete: (body: { userType: Extract<EduviaRole, 'teacher' | 'parent'>; firstName: string; lastName: string; timezone: string }) =>
    apiClient.post<unknown>('/users/me/onboarding', body).then((response) => response.data),
}
