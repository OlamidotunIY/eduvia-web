import type { CreateSubjectDto, UpdateSubjectDto } from "@/shared/api/generated";

export interface PlatformSubjectProps {
  id: string;
  name: string;
  shortCode: string;
  description: string | null;
  isActive: boolean;
}

export class PlatformSubject {
  readonly id: string;
  readonly name: string;
  readonly shortCode: string;
  readonly description: string | null;
  readonly isActive: boolean;

  constructor(props: PlatformSubjectProps) {
    this.id = props.id;
    this.name = props.name;
    this.shortCode = props.shortCode;
    this.description = props.description;
    this.isActive = props.isActive;
  }
}

export interface OrganizationSubjectRecordProps {
  id: string;
  orgId: string;
  name: string;
  platformSubjectId: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export class OrganizationSubjectRecord {
  readonly id: string;
  readonly orgId: string;
  readonly name: string;
  readonly platformSubjectId: string | null;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;

  constructor(props: OrganizationSubjectRecordProps) {
    this.id = props.id;
    this.orgId = props.orgId;
    this.name = props.name;
    this.platformSubjectId = props.platformSubjectId;
    this.description = props.description;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
  }

  isLinkedToPlatform(): boolean {
    return Boolean(this.platformSubjectId);
  }
}

export type { CreateSubjectDto, UpdateSubjectDto };
