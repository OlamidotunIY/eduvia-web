import { apiClient } from '@/shared/api'
import type {
  ChangeMemberRoleInput,
  OrganizationMemberRecord,
  OrganizationRoleRecord,
  SendInvitationInput,
} from '@/shared/domain'

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
    apiClient
      .get<OrganizationRoleRecord[]>(`/organizations/${organizationId}/roles`)
      .then((response) => response.data),

  provisionRoles: (organizationId: string) =>
    apiClient.post(`/organizations/${organizationId}/roles/provision`).then(() => undefined),

  createRole: (organizationId: string, body: { name: string; description: string | null; permissions: string[] }) =>
    apiClient.post(`/organizations/${organizationId}/roles`, body).then(() => undefined),

  updateRole: (organizationId: string, roleId: string, body: { name: string; description: string | null; permissions: string[] }) =>
    apiClient.patch(`/organizations/${organizationId}/roles/${roleId}`, body).then(() => undefined),

  listMembers: (organizationId: string) =>
    apiClient
      .get<OrganizationMemberRecord[]>(`/organizations/${organizationId}/members`)
      .then((response) => response.data),

  inviteMember: (organizationId: string, body: SendInvitationInput) =>
    apiClient
      .post<{ id: string; rawToken?: string }>(`/organizations/${organizationId}/invitations`, body)
      .then((response) => response.data),

  changeMemberRole: (organizationId: string, userId: string, body: ChangeMemberRoleInput) =>
    apiClient
      .patch(`/organizations/${organizationId}/members/${userId}/role`, body)
      .then(() => undefined),

  suspendMember: (organizationId: string, userId: string) =>
    apiClient
      .delete(`/organizations/${organizationId}/members/${userId}`)
      .then(() => undefined),
}
