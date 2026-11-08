import type { OrganizationPermission } from '../../auth/entities/current-user.entity';
import type { CreateOrganizationRoleDto, UpdateOrganizationRoleDto } from '@/shared/api/generated';

export interface OrganizationRoleDefinitionProps {
  id: string;
  orgId: string;
  key: string | null;
  name: string;
  description: string | null;
  permissions: OrganizationPermission[];
  isSystem: boolean;
  membersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class OrganizationRoleDefinition {
  readonly id: string;
  readonly orgId: string;
  readonly key: string | null;
  readonly name: string;
  readonly description: string | null;
  readonly permissions: OrganizationPermission[];
  readonly isSystem: boolean;
  readonly membersCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(props: OrganizationRoleDefinitionProps) {
    this.id = props.id;
    this.orgId = props.orgId;
    this.key = props.key;
    this.name = props.name;
    this.description = props.description;
    this.permissions = props.permissions;
    this.isSystem = props.isSystem;
    this.membersCount = props.membersCount ?? 0;
    this.createdAt = props.createdAt ?? '';
    this.updatedAt = props.updatedAt ?? '';
  }

  get displayType(): 'System' | 'Custom' {
    return this.isSystem ? 'System' : 'Custom';
  }

  get permissionsCount(): number {
    return this.permissions.length;
  }

  hasPermission(permission: OrganizationPermission): boolean {
    return this.permissions.includes(permission);
  }
}

export type { CreateOrganizationRoleDto, UpdateOrganizationRoleDto };
