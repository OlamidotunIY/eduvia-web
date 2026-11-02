import type { MarketplaceOrganization } from '../entities/marketplace-organization.entity'

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
}
