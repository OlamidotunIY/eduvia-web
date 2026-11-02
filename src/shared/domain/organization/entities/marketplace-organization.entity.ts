export interface MarketplaceOrganization {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  country: string
  timezone: string
  acceptingTeachers: boolean
}
