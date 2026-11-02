import {
  type MarketplaceOrganization,
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
