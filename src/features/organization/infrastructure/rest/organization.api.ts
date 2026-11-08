import { apiClient } from '@/shared/api';
import type {
  CreateOrganizationDto,
  CreateOrganizationRoleDto,
  UpdateOrganizationRoleDto,
  SendInvitationDto,
  ChangeMemberRoleDto,
  OrgAnalyticsResponseDto,
} from '@/shared/api/generated';
import type { OrganizationRoleRecord } from '@/shared/domain';

export const organizationApi = {
  create: (body: CreateOrganizationDto) =>
    apiClient.post('/organizations', body).then(() => undefined),

  listMarketplace: () =>
    apiClient.get<unknown>('/marketplace/organizations').then((response) => response.data),

  apply: (organizationId: string) =>
    apiClient
      .post(`/organizations/${organizationId}/applications`, {
        orgId: organizationId,
        applicantUserId: '',
        appliedSubjects: [],
      })
      .then(() => undefined),

  selectActive: (organizationId: string) =>
    apiClient.post(`/organizations/active/${organizationId}`).then(() => undefined),

  listRoles: (organizationId: string) =>
    apiClient
      .get<OrganizationRoleRecord[]>(`/organizations/${organizationId}/roles`)
      .then((response) => response.data),

  listPermissions: (organizationId: string) =>
    apiClient
      .get<unknown[]>(`/organizations/${organizationId}/permissions`)
      .then((response) => response.data),

  provisionRoles: (organizationId: string) =>
    apiClient.post(`/organizations/${organizationId}/roles/provision`).then(() => undefined),

  createRole: (organizationId: string, body: CreateOrganizationRoleDto) =>
    apiClient.post(`/organizations/${organizationId}/roles`, body).then(() => undefined),

  updateRole: (organizationId: string, roleId: string, body: UpdateOrganizationRoleDto) =>
    apiClient.patch(`/organizations/${organizationId}/roles/${roleId}`, body).then(() => undefined),

  listMembers: (organizationId: string) =>
    apiClient
      .get<unknown[]>(`/organizations/${organizationId}/members`)
      .then((response) => response.data),

  inviteMember: (organizationId: string, body: SendInvitationDto) =>
    apiClient
      .post(`/organizations/${organizationId}/invitations`, body)
      .then((response) => response.data),

  changeMemberRole: (
    organizationId: string,
    userId: string,
    body: ChangeMemberRoleDto,
  ) =>
    apiClient
      .patch(`/organizations/${organizationId}/members/${userId}/role`, body)
      .then((response) => response.data),

  suspendMember: (organizationId: string, userId: string) =>
    apiClient
      .post(`/organizations/${organizationId}/members/${userId}/suspend`, {})
      .then((response) => response.data),

  getAnalytics: (organizationId: string, date?: string) =>
    apiClient
      .get<OrgAnalyticsResponseDto>(`/orgs/${organizationId}/analytics`, {
        params: date ? { date } : undefined,
      })
      .then((response) => response.data),
};
