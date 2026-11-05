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

  listRoles: (organizationId: string) =>
    apiClient.get<unknown>(`/organizations/${organizationId}/roles`).then((response) => response.data),

  provisionRoles: (organizationId: string) =>
    apiClient.post(`/organizations/${organizationId}/roles/provision`).then(() => undefined),

  createRole: (organizationId: string, body: { name: string; description: string | null; permissions: string[] }) =>
    apiClient.post(`/organizations/${organizationId}/roles`, body).then(() => undefined),

  updateRole: (organizationId: string, roleId: string, body: { name: string; description: string | null; permissions: string[] }) =>
    apiClient.patch(`/organizations/${organizationId}/roles/${roleId}`, body).then(() => undefined),
}
