export type OrganizationMemberRole =
  | 'OrgOwner'
  | 'OrgAdmin'
  | 'LeadTeacher'
  | 'Teacher'
  | 'TeachingAssistant'
  | string;

export type OrganizationMemberStatus = 'active' | 'suspended' | 'inactive';

export interface OrganizationMemberUser {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  image?: string | null;
  avatarUrl?: string | null;
  status?: string;
}

export interface OrganizationMemberRecord {
  id: string;
  orgId: string;
  userId: string;
  role: OrganizationMemberRole;
  roleId: string | null;
  subjects: string[];
  status: OrganizationMemberStatus;
  joinedAt: string;
  updatedAt: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  user?: OrganizationMemberUser | null;
}

export interface OrganizationRoleRecord {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isCustom?: boolean;
}

export interface SendInvitationInput {
  inviteeEmail: string;
  role: string;
  subjects?: string[];
}

export interface ChangeMemberRoleInput {
  role?: string;
  roleId?: string;
}
