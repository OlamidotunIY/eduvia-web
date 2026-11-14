import type {
  MarketplaceOrganization,
  MarketplaceSubjectItem,
} from '../entities/marketplace-organization.entity';
import type { OrganizationRoleDefinition } from '../entities/organization-role.entity';
import type { OrganizationPermissionDefinition } from '../entities/organization-permission.entity';
import type { OrgAnalyticsEntity } from '../entities/org-analytics.entity';
import type {
  ApplyToOrganizationInput,
  ApproveTeacherApplicationInput,
  RejectTeacherApplicationInput,
  TeacherApplicationRecord,
  TeacherApplicationSettings,
  TeacherApplicationStatus,
} from '../entities/teacher-application.entity';
import type {
  CreateOrganizationDto,
  CreateOrganizationRoleDto,
  UpdateOrganizationRoleDto,
  SendInvitationDto,
  ChangeMemberRoleDto,
} from '@/shared/api/generated';
import type { OrganizationMemberRecord } from '../entities/organization-member.entity';

export abstract class IOrganizationRepository {
  abstract create(input: CreateOrganizationDto): Promise<void>;
  abstract listMarketplace(): Promise<MarketplaceOrganization[]>;
  abstract listMarketplaceOrganizationSubjects(organizationId: string): Promise<MarketplaceSubjectItem[]>;
  abstract apply(organizationId: string, input?: ApplyToOrganizationInput): Promise<void>;
  abstract listApplications(
    organizationId: string,
    status?: TeacherApplicationStatus,
  ): Promise<TeacherApplicationRecord[]>;
  abstract getApplicationSettings(organizationId: string): Promise<TeacherApplicationSettings>;
  abstract updateApplicationSettings(
    organizationId: string,
    input: { acceptingTeachers?: boolean; marketplaceListed?: boolean },
  ): Promise<TeacherApplicationSettings>;
  abstract approveApplication(
    organizationId: string,
    applicationId: string,
    input?: ApproveTeacherApplicationInput,
  ): Promise<unknown>;
  abstract rejectApplication(
    organizationId: string,
    applicationId: string,
    input?: RejectTeacherApplicationInput,
  ): Promise<unknown>;
  abstract selectActive(organizationId: string): Promise<void>;
  abstract listRoles(organizationId: string): Promise<OrganizationRoleDefinition[]>;
  abstract listPermissions(organizationId: string): Promise<OrganizationPermissionDefinition[]>;
  abstract provisionRoles(organizationId: string): Promise<void>;
  abstract createRole(organizationId: string, input: CreateOrganizationRoleDto): Promise<void>;
  abstract updateRole(organizationId: string, roleId: string, input: UpdateOrganizationRoleDto): Promise<void>;
  abstract listMembers(organizationId: string): Promise<OrganizationMemberRecord[]>;
  abstract inviteMember(organizationId: string, input: SendInvitationDto): Promise<unknown>;
  abstract changeMemberRole(organizationId: string, userId: string, input: ChangeMemberRoleDto): Promise<unknown>;
  abstract suspendMember(organizationId: string, userId: string): Promise<unknown>;
  abstract getAnalytics(organizationId: string, date?: string): Promise<OrgAnalyticsEntity>;
}
