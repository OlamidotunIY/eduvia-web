import {
  MarketplaceOrganization,
  OrganizationMemberRecord,
  OrganizationRoleDefinition,
  IOrganizationRepository,
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

  async apply(organizationId: string): Promise<void> {
    await organizationApi.apply(organizationId);
  }

  async selectActive(organizationId: string): Promise<void> {
    await organizationApi.selectActive(organizationId);
  }

  async listRoles(organizationId: string): Promise<OrganizationRoleDefinition[]> {
    const value = await organizationApi.listRoles(organizationId);
    if (!Array.isArray(value)) throw new Error('The API returned an invalid organization role response.');
    return value.map((item) => this.toOrganizationRole(item));
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
    });
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
