import {
  MarketplaceOrganization,
  type MarketplaceSubjectItem,
  OrganizationMemberRecord,
  OrganizationRoleDefinition,
  OrganizationPermissionDefinition,
  OrgAnalyticsEntity,
  IOrganizationRepository,
  type ApplyToOrganizationInput,
  type ApproveTeacherApplicationInput,
  type RejectTeacherApplicationInput,
  type TeacherApplicationRecord,
  type TeacherApplicationSettings,
  type TeacherApplicationStatus,
} from '@/shared/domain';
import type {
  CreateOrganizationDto,
  CreateOrganizationRoleDto,
  UpdateOrganizationRoleDto,
  SendInvitationDto,
  ChangeMemberRoleDto,
} from '@/shared/api/generated';
import { organizationApi } from '../rest/organization.api';

export class OrganizationRepository implements IOrganizationRepository {
  async create(input: CreateOrganizationDto): Promise<void> {
    await organizationApi.create(input);
  }

  async listMarketplace(): Promise<MarketplaceOrganization[]> {
    const value = await organizationApi.listMarketplace();
    if (!Array.isArray(value)) throw new Error('The API returned an invalid marketplace response.');
    return value.map((item) => this.toMarketplaceOrganization(item));
  }

  async listMarketplaceOrganizationSubjects(
    organizationId: string,
  ): Promise<MarketplaceSubjectItem[]> {
    const raw = await organizationApi.listMarketplaceOrganizationSubjects(organizationId);
    if (!Array.isArray(raw)) return [];
    return raw.map((subject) => ({
      id: String(subject.id ?? ''),
      name: String(subject.name ?? ''),
      description: typeof subject.description === 'string' ? subject.description : null,
    }));
  }

  async apply(organizationId: string, input?: ApplyToOrganizationInput): Promise<void> {
    await organizationApi.apply(organizationId, input);
  }

  async listApplications(
    organizationId: string,
    status?: TeacherApplicationStatus,
  ): Promise<TeacherApplicationRecord[]> {
    const raw = await organizationApi.listApplications(organizationId, status);
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => this.toTeacherApplication(item));
  }

  async getApplicationSettings(organizationId: string): Promise<TeacherApplicationSettings> {
    return organizationApi.getApplicationSettings(organizationId);
  }

  async updateApplicationSettings(
    organizationId: string,
    input: { acceptingTeachers?: boolean; marketplaceListed?: boolean },
  ): Promise<TeacherApplicationSettings> {
    return organizationApi.updateApplicationSettings(organizationId, input);
  }

  async approveApplication(
    organizationId: string,
    applicationId: string,
    input?: ApproveTeacherApplicationInput,
  ): Promise<unknown> {
    return organizationApi.approveApplication(organizationId, applicationId, input);
  }

  async rejectApplication(
    organizationId: string,
    applicationId: string,
    input?: RejectTeacherApplicationInput,
  ): Promise<unknown> {
    return organizationApi.rejectApplication(organizationId, applicationId, input);
  }

  async selectActive(organizationId: string): Promise<void> {
    await organizationApi.selectActive(organizationId);
  }

  async listRoles(organizationId: string): Promise<OrganizationRoleDefinition[]> {
    const value = await organizationApi.listRoles(organizationId);
    if (!Array.isArray(value)) throw new Error('The API returned an invalid organization role response.');
    return value.map((item) => this.toOrganizationRole(item));
  }

  async listPermissions(organizationId: string): Promise<OrganizationPermissionDefinition[]> {
    const raw = await organizationApi.listPermissions(organizationId);
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => this.toOrganizationPermission(item));
  }

  async provisionRoles(organizationId: string): Promise<void> {
    await organizationApi.provisionRoles(organizationId);
  }

  async createRole(organizationId: string, input: CreateOrganizationRoleDto): Promise<void> {
    await organizationApi.createRole(organizationId, input);
  }

  async updateRole(organizationId: string, roleId: string, input: UpdateOrganizationRoleDto): Promise<void> {
    await organizationApi.updateRole(organizationId, roleId, input);
  }

  async listMembers(organizationId: string): Promise<OrganizationMemberRecord[]> {
    const raw = await organizationApi.listMembers(organizationId);
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => this.toOrganizationMember(item));
  }

  async inviteMember(organizationId: string, input: SendInvitationDto): Promise<unknown> {
    return organizationApi.inviteMember(organizationId, input);
  }

  async changeMemberRole(
    organizationId: string,
    userId: string,
    input: ChangeMemberRoleDto,
  ): Promise<unknown> {
    return organizationApi.changeMemberRole(organizationId, userId, input);
  }

  async suspendMember(organizationId: string, userId: string): Promise<unknown> {
    return organizationApi.suspendMember(organizationId, userId);
  }

  async getAnalytics(organizationId: string, date?: string): Promise<OrgAnalyticsEntity> {
    const raw = await organizationApi.getAnalytics(organizationId, date);
    return OrgAnalyticsEntity.fromDto(raw);
  }

  private toMarketplaceOrganization(value: unknown): MarketplaceOrganization {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('The API returned an invalid marketplace organization.');
    }
    const organization = value as Record<string, unknown>;
    return new MarketplaceOrganization({
      id: this.readString(organization, 'id'),
      name: this.readString(organization, 'name'),
      slug: this.readString(organization, 'slug'),
      description: typeof organization.description === 'string' ? organization.description : null,
      logoUrl: typeof organization.logoUrl === 'string' ? organization.logoUrl : null,
      websiteUrl: typeof organization.websiteUrl === 'string' ? organization.websiteUrl : null,
      country: this.readString(organization, 'country'),
      timezone: this.readString(organization, 'timezone'),
      acceptingTeachers: Boolean(organization.acceptingTeachers),
      subjects: Array.isArray(organization.subjects)
        ? organization.subjects.map((subject) => {
            const item =
              subject && typeof subject === 'object'
                ? (subject as Record<string, unknown>)
                : {};
            return {
              id: String(item.id ?? ''),
              name: String(item.name ?? ''),
              description: typeof item.description === 'string' ? item.description : null,
            };
          })
        : [],
    });
  }

  private toTeacherApplication(rawValue: unknown): TeacherApplicationRecord {
    const raw =
      rawValue && typeof rawValue === 'object'
        ? (rawValue as Record<string, unknown>)
        : {};
    const appliedSubjects: string[] = Array.isArray(raw.appliedSubjects)
      ? raw.appliedSubjects.map((value: unknown) => String(value))
      : [];
    const appliedSubjectDetails = Array.isArray(raw.appliedSubjectDetails)
      ? raw.appliedSubjectDetails.map((item) => {
          const entry =
            item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
          return {
            id: String(entry.id ?? ''),
            name: String(entry.name ?? entry.id ?? ''),
          };
        })
      : appliedSubjects.map((value) => ({ id: value, name: value }));
    const approvedSubjects: string[] | null = Array.isArray(raw.approvedSubjects)
      ? raw.approvedSubjects.map((value: unknown) => String(value))
      : null;
    const approvedSubjectDetails = Array.isArray(raw.approvedSubjectDetails)
      ? raw.approvedSubjectDetails.map((item) => {
          const entry =
            item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
          return {
            id: String(entry.id ?? ''),
            name: String(entry.name ?? entry.id ?? ''),
          };
        })
      : approvedSubjects
        ? approvedSubjects.map((value) => ({ id: value, name: value }))
        : null;

    return {
      id: String(raw.id ?? ''),
      orgId: String(raw.orgId ?? ''),
      applicantUserId: String(raw.applicantUserId ?? ''),
      applicant:
        raw.applicant && typeof raw.applicant === 'object'
          ? (raw.applicant as TeacherApplicationRecord['applicant'])
          : null,
      appliedSubjects,
      appliedSubjectDetails,
      status: (raw.status as TeacherApplicationStatus) ?? 'pending_review',
      rejectionReason: typeof raw.rejectionReason === 'string' ? raw.rejectionReason : null,
      reviewedBy: typeof raw.reviewedBy === 'string' ? raw.reviewedBy : null,
      reviewer:
        raw.reviewer && typeof raw.reviewer === 'object'
          ? (raw.reviewer as TeacherApplicationRecord['reviewer'])
          : null,
      reviewedAt: raw.reviewedAt ? String(raw.reviewedAt) : null,
      coverLetter: typeof raw.coverLetter === 'string' ? raw.coverLetter : null,
      qualifications: typeof raw.qualifications === 'string' ? raw.qualifications : null,
      assignedRole: typeof raw.assignedRole === 'string' ? raw.assignedRole : null,
      assignedRoleId: typeof raw.assignedRoleId === 'string' ? raw.assignedRoleId : null,
      assignedRoleName: typeof raw.assignedRoleName === 'string' ? raw.assignedRoleName : null,
      approvedSubjects,
      approvedSubjectDetails,
      createdAt: String(raw.createdAt ?? new Date().toISOString()),
      updatedAt: String(raw.updatedAt ?? raw.createdAt ?? new Date().toISOString()),
    };
  }

  private toOrganizationRole(value: unknown): OrganizationRoleDefinition {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('The API returned an invalid organization role.');
    }
    const role = value as Record<string, unknown>;
    const permissions = role.permissions;
    if (!Array.isArray(permissions) || !permissions.every((permission) => typeof permission === 'string')) {
      throw new Error('The API returned an invalid organization role permission set.');
    }
    return new OrganizationRoleDefinition({
      id: this.readString(role, 'id'),
      orgId: typeof role.orgId === 'string' ? role.orgId : '',
      key: typeof role.key === 'string' ? role.key : null,
      name: this.readString(role, 'name'),
      description: typeof role.description === 'string' ? role.description : null,
      permissions: permissions as any[],
      isSystem: Boolean(role.isSystem),
      membersCount: typeof role.membersCount === 'number' ? role.membersCount : 0,
      createdAt: typeof role.createdAt === 'string' ? role.createdAt : '',
      updatedAt: typeof role.updatedAt === 'string' ? role.updatedAt : '',
    });
  }

  private toOrganizationPermission(value: unknown): OrganizationPermissionDefinition {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('The API returned an invalid organization permission.');
    }
    const perm = value as Record<string, unknown>;
    return new OrganizationPermissionDefinition({
      id: this.readString(perm, 'id'),
      name: this.readString(perm, 'name'),
      category: this.readString(perm, 'category'),
      description: typeof perm.description === 'string' ? perm.description : undefined,
    });
  }

  private toOrganizationMember(raw: any): OrganizationMemberRecord {
    if (raw instanceof OrganizationMemberRecord) return raw;
    return new OrganizationMemberRecord({
      id: String(raw.id ?? ''),
      orgId: String(raw.orgId ?? ''),
      userId: String(raw.userId ?? ''),
      role: raw.role ?? 'Teacher',
      roleId: raw.roleId ?? null,
      subjects: Array.isArray(raw.subjects) ? raw.subjects : [],
      status: raw.status ?? 'active',
      joinedAt: String(raw.joinedAt ?? raw.createdAt ?? new Date().toISOString()),
      updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
      fullName: raw.fullName ?? raw.user?.fullName ?? null,
      firstName: raw.firstName ?? raw.user?.firstName ?? null,
      lastName: raw.lastName ?? raw.user?.lastName ?? null,
      email: raw.email ?? raw.user?.email ?? null,
      image: raw.image ?? raw.user?.image ?? null,
      avatarUrl: raw.avatarUrl ?? raw.user?.avatarUrl ?? null,
      user: raw.user ?? null,
    });
  }

  private readString(value: Record<string, unknown>, key: string): string {
    const field = value[key];
    if (typeof field !== 'string') throw new Error(`The API response is missing ${key}.`);
    return field;
  }
}

export const organizationRepository = new OrganizationRepository();
