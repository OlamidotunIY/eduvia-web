import { apiClient } from '@/shared/api';
import type {
  CreateOrganizationDto,
  CreateOrganizationRoleDto,
  UpdateOrganizationRoleDto,
  SendInvitationDto,
  ChangeMemberRoleDto,
  OrgAnalyticsResponseDto,
} from '@/shared/api/generated';
import type {
  OrganizationRoleRecord,
  ApplyToOrganizationInput,
  ApproveTeacherApplicationInput,
  RejectTeacherApplicationInput,
  TeacherApplicationRecord,
  TeacherApplicationSettings,
  TeacherApplicationStatus,
  MarketplaceSubjectItem,
} from '@/shared/domain';

export const organizationApi = {
  create: (body: CreateOrganizationDto) =>
    apiClient.post('/organizations', body).then(() => undefined),

  listMarketplace: () =>
    apiClient.get<unknown>('/marketplace/organizations').then((response) => response.data),

  listMarketplaceOrganizationSubjects: (organizationId: string) =>
    apiClient
      .get<MarketplaceSubjectItem[]>(`/marketplace/organizations/${organizationId}/subjects`)
      .then((response) => response.data),

  apply: (organizationId: string, input?: ApplyToOrganizationInput) =>
    apiClient
      .post(`/organizations/${organizationId}/applications`, {
        appliedSubjects: input?.appliedSubjects ?? [],
        coverLetter: input?.coverLetter ?? null,
        qualifications: input?.qualifications ?? null,
      })
      .then(() => undefined),

  listApplications: (organizationId: string, status?: TeacherApplicationStatus) =>
    apiClient
      .get<TeacherApplicationRecord[]>(`/organizations/${organizationId}/applications`, {
        params: status ? { status } : undefined,
      })
      .then((response) => response.data),

  getApplicationSettings: (organizationId: string) =>
    apiClient
      .get<TeacherApplicationSettings>(`/organizations/${organizationId}/applications/settings`)
      .then((response) => response.data),

  updateApplicationSettings: (
    organizationId: string,
    body: { acceptingTeachers?: boolean; marketplaceListed?: boolean },
  ) =>
    apiClient
      .patch<TeacherApplicationSettings>(
        `/organizations/${organizationId}/applications/settings`,
        body,
      )
      .then((response) => response.data),

  approveApplication: (
    organizationId: string,
    applicationId: string,
    body?: ApproveTeacherApplicationInput,
  ) =>
    apiClient
      .post(`/organizations/${organizationId}/applications/${applicationId}/approve`, body ?? {})
      .then((response) => response.data),

  rejectApplication: (
    organizationId: string,
    applicationId: string,
    body?: RejectTeacherApplicationInput,
  ) =>
    apiClient
      .post(`/organizations/${organizationId}/applications/${applicationId}/reject`, body ?? {})
      .then((response) => response.data),

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
