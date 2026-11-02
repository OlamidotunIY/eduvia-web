import { apiClient } from '@/shared/api'

export const organizationApi = {
  create: (body: {
    name: string
    slug: string
    contactEmail: string
    country: string
    timezone: string
  }) => apiClient.post('/organizations', body).then(() => undefined),

  listMarketplace: () => apiClient.get<unknown>('/marketplace/organizations').then((response) => response.data),

  apply: (organizationId: string) =>
    apiClient.post(`/organizations/${organizationId}/applications`, {
      orgId: organizationId,
      applicantUserId: '',
      appliedSubjects: [],
    }).then(() => undefined),

  selectActive: (organizationId: string) =>
    apiClient.post(`/organizations/active/${organizationId}`).then(() => undefined),
}
