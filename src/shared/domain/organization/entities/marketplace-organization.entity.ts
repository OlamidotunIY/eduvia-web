export interface MarketplaceSubjectItem {
  id: string;
  name: string;
  description: string | null;
}

export interface MarketplaceOrganizationProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  country: string;
  timezone: string;
  acceptingTeachers: boolean;
  subjects?: MarketplaceSubjectItem[];
}

export class MarketplaceOrganization {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly logoUrl: string | null;
  readonly websiteUrl: string | null;
  readonly country: string;
  readonly timezone: string;
  readonly acceptingTeachers: boolean;
  readonly subjects: MarketplaceSubjectItem[];

  constructor(props: MarketplaceOrganizationProps) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.logoUrl = props.logoUrl;
    this.websiteUrl = props.websiteUrl;
    this.country = props.country;
    this.timezone = props.timezone;
    this.acceptingTeachers = props.acceptingTeachers;
    this.subjects = props.subjects ?? [];
  }

  isAvailable(): boolean {
    return this.acceptingTeachers;
  }
}
