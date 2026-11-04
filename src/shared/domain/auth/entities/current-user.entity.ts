export type EduviaRole = 'pending' | 'teacher' | 'parent' | 'student' | 'admin'

export type OrganizationPermission =
  | 'organization:read'
  | 'organization:update'
  | 'organization:policy:update'
  | 'organization:marketplace:manage'
  | 'roles:read'
  | 'roles:manage'
  | 'members:read'
  | 'members:invite'
  | 'members:manage'
  | 'applications:read'
  | 'applications:review'
  | 'subjects:read'
  | 'subjects:create'
  | 'subjects:update'
  | 'classrooms:read'
  | 'classrooms:create'
  | 'classrooms:update'
  | 'classrooms:manage_students'
  | 'lessons:read'
  | 'lessons:schedule'
  | 'lessons:manage'
  | 'curriculum:read'
  | 'curriculum:manage'
  | 'questions:read'
  | 'questions:create'
  | 'questions:update'
  | 'questions:delete'
  | 'questions:publish'
  | 'assessments:read'
  | 'assessments:create'
  | 'assessments:mark'
  | 'assessments:finalize'
  | 'reports:read'
  | 'reports:create'
  | 'reports:update'
  | 'reports:submit'
  | 'reports:approve_ai'
  | 'progress:read'
  | 'analytics:read'
  | 'conversations:read'
  | 'conversations:manage'
  | 'billing:read'
  | 'billing:manage'

export interface OrganizationMembership {
  id: string
  name: string
  slug: string
  role: string
  status: string
  memberCount: number
}

export interface ActiveOrganization {
  id: string
  name: string
  slug: string
  role: string
  roleId: string | null
  roleName: string
  permissions: OrganizationPermission[]
  memberCount: number
}

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
  image: string | null
  userType: EduviaRole
  onboardingStatus: string
  emailVerified: boolean
  timezone: string
}

export interface CurrentUserBootstrap {
  user: CurrentUser
  activeOrganization: ActiveOrganization | null
  organizations: OrganizationMembership[]
}

export function isOnboardingComplete(user: CurrentUserBootstrap): boolean {
  return user.user.onboardingStatus === 'completed'
}
