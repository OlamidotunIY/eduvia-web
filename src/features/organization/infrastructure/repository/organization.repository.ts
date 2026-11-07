import {
  type MarketplaceOrganization,
  type OrganizationRoleDefinition,
  type OrganizationRoleInput,
  IOrganizationRepository,
  type OrganizationCreation,
} from '@/shared/domain'
import { organizationApi } from '../rest/organization.api'

export class OrganizationRepository implements IOrganizationRepository {
  async create(input: OrganizationCreation): Promise<void> {
    await organizationApi.create(input)
  }

  async listMarketplace(): Promise<MarketplaceOrganization[]> {
    const value = await organizationApi.listMarketplace()
    if (!Array.isArray(value)) throw new Error('The API returned an invalid marketplace response.')
    return value.map(toMarketplaceOrganization)
  }

  async apply(organizationId: string): Promise<void> {
    await organizationApi.apply(organizationId)
  }

  async selectActive(organizationId: string): Promise<void> {
    await organizationApi.selectActive(organizationId)
  }

  async listRoles(organizationId: string): Promise<OrganizationRoleDefinition[]> {
    const value = await organizationApi.listRoles(organizationId)
    if (!Array.isArray(value)) throw new Error('The API returned an invalid organization role response.')
    return value.map(toOrganizationRole)
  }

  async provisionRoles(organizationId: string): Promise<void> {
    await organizationApi.provisionRoles(organizationId)
  }

  async createRole(organizationId: string, input: OrganizationRoleInput): Promise<void> {
    await organizationApi.createRole(organizationId, input)
  }

  async updateRole(organizationId: string, roleId: string, input: OrganizationRoleInput): Promise<void> {
    await organizationApi.updateRole(organizationId, roleId, input)
  }

  async listMembers(organizationId: string) {
    return organizationApi.listMembers(organizationId)
  }

  async inviteMember(organizationId: string, input: Parameters<typeof organizationApi.inviteMember>[1]) {
    return organizationApi.inviteMember(organizationId, input)
  }

  async changeMemberRole(organizationId: string, userId: string, input: Parameters<typeof organizationApi.changeMemberRole>[2]) {
    return organizationApi.changeMemberRole(organizationId, userId, input)
  }

  async suspendMember(organizationId: string, userId: string) {
    return organizationApi.suspendMember(organizationId, userId)
  }
}

export const organizationRepository = new OrganizationRepository()

function toMarketplaceOrganization(value: unknown): MarketplaceOrganization {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The API returned an invalid marketplace organization.')
  }
  const organization = value as Record<string, unknown>
  return {
    id: readString(organization, 'id'),
    name: readString(organization, 'name'),
    slug: readString(organization, 'slug'),
    description: typeof organization.description === 'string' ? organization.description : null,
    logoUrl: typeof organization.logoUrl === 'string' ? organization.logoUrl : null,
    websiteUrl: typeof organization.websiteUrl === 'string' ? organization.websiteUrl : null,
    country: readString(organization, 'country'),
    timezone: readString(organization, 'timezone'),
    acceptingTeachers: Boolean(organization.acceptingTeachers),
  }
}

function readString(value: Record<string, unknown>, key: string): string {
  const field = value[key]
  if (typeof field !== 'string') throw new Error(`The API response is missing ${key}.`)
  return field
}

function toOrganizationRole(value: unknown): OrganizationRoleDefinition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The API returned an invalid organization role.')
  }
  const role = value as Record<string, unknown>
  const permissions = role.permissions
  if (!Array.isArray(permissions) || !permissions.every((permission) => typeof permission === 'string')) {
    throw new Error('The API returned an invalid organization role permission set.')
  }
  return {
    id: readString(role, 'id'),
    orgId: readString(role, 'orgId'),
    key: typeof role.key === 'string' ? role.key : null,
    name: readString(role, 'name'),
    description: typeof role.description === 'string' ? role.description : null,
    permissions: permissions as OrganizationRoleDefinition['permissions'],
    isSystem: Boolean(role.isSystem),
  }
}
