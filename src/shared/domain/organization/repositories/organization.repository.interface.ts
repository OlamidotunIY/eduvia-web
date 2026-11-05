import type { MarketplaceOrganization } from '../entities/marketplace-organization.entity'
import type { OrganizationRoleDefinition, OrganizationRoleInput } from '../entities/organization-role.entity'

export interface OrganizationCreation {
  name: string
  slug: string
  contactEmail: string
  country: string
  timezone: string
}

export abstract class IOrganizationRepository {
  abstract create(input: OrganizationCreation): Promise<void>
  abstract listMarketplace(): Promise<MarketplaceOrganization[]>
  abstract apply(organizationId: string): Promise<void>
  abstract selectActive(organizationId: string): Promise<void>
  abstract listRoles(organizationId: string): Promise<OrganizationRoleDefinition[]>
  abstract provisionRoles(organizationId: string): Promise<void>
  abstract createRole(organizationId: string, input: OrganizationRoleInput): Promise<void>
  abstract updateRole(organizationId: string, roleId: string, input: OrganizationRoleInput): Promise<void>
}
