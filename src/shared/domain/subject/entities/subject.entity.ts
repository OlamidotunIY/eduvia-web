export interface PlatformSubject {
  id: string;
  name: string;
  shortCode: string;
  description: string | null;
  isActive: boolean;
}

export interface OrganizationSubjectRecord {
  id: string;
  orgId: string;
  name: string;
  platformSubjectId: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface OrganizationSubjectInput {
  name: string;
  platformSubjectId?: string | null;
  description?: string | null;
  isActive?: boolean;
}
