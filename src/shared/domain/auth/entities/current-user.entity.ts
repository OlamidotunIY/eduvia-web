export type EduviaRole = 'pending' | 'teacher' | 'parent' | 'student' | 'admin'

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
