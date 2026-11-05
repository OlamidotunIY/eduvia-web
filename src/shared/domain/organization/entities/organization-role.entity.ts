import type { OrganizationPermission } from '../../auth/entities/current-user.entity'

export interface OrganizationRoleDefinition {
  id: string
  orgId: string
  key: string | null
  name: string
  description: string | null
  permissions: OrganizationPermission[]
  isSystem: boolean
}

export interface OrganizationRoleInput {
  name: string
  description: string | null
  permissions: OrganizationPermission[]
}
