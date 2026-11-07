import { apiClient } from '@/shared/api';
import type { CompleteUserOnboardingDto } from '@/shared/api/generated';

export const onboardingApi = {
  complete: (body: CompleteUserOnboardingDto) =>
    apiClient.post<unknown>('/users/me/onboarding', body).then((response) => response.data),
};
