import type { SendInvitationDto, ChangeMemberRoleDto } from "@/shared/api/generated";

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

export interface OrganizationMemberRecordProps {
  id: string;
  orgId: string;
  userId: string;
  role: OrganizationMemberRole;
  roleId: string | null;
  subjects?: string[];
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

export class OrganizationMemberRecord {
  readonly id: string;
  readonly orgId: string;
  readonly userId: string;
  readonly role: OrganizationMemberRole;
  readonly roleId: string | null;
  readonly subjects: string[];
  readonly status: OrganizationMemberStatus;
  readonly joinedAt: string;
  readonly updatedAt: string;
  readonly fullName?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly email?: string | null;
  readonly image?: string | null;
  readonly avatarUrl?: string | null;
  readonly user?: OrganizationMemberUser | null;

  constructor(props: OrganizationMemberRecordProps) {
    this.id = props.id;
    this.orgId = props.orgId;
    this.userId = props.userId;
    this.role = props.role;
    this.roleId = props.roleId;
    this.subjects = props.subjects ?? [];
    this.status = props.status;
    this.joinedAt = props.joinedAt;
    this.updatedAt = props.updatedAt;
    this.fullName =
      props.fullName ??
      props.user?.fullName ??
      (props.user?.firstName && props.user?.lastName
        ? `${props.user.firstName} ${props.user.lastName}`
        : null);
    this.firstName = props.firstName ?? props.user?.firstName ?? null;
    this.lastName = props.lastName ?? props.user?.lastName ?? null;
    this.email = props.email ?? props.user?.email ?? null;
    this.image = props.image ?? props.user?.image ?? null;
    this.avatarUrl = props.avatarUrl ?? props.user?.avatarUrl ?? props.user?.image ?? null;
    this.user = props.user ?? null;
  }

  getDisplayName(): string {
    return (
      this.fullName ||
      (this.firstName && this.lastName ? `${this.firstName} ${this.lastName}` : '') ||
      this.email ||
      'Member'
    );
  }

  getInitials(): string {
    const name = this.getDisplayName();
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] ?? 'M').toUpperCase();
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  isSuspended(): boolean {
    return this.status === 'suspended';
  }

  getRoleDisplayName(): string {
    switch (this.role) {
      case 'OrgOwner':
        return 'Owner';
      case 'OrgAdmin':
        return 'Admin';
      case 'LeadTeacher':
        return 'Lead teacher';
      case 'Teacher':
        return 'Teacher';
      case 'TeachingAssistant':
        return 'Teaching assistant';
      default:
        return this.role;
    }
  }

  getFormattedJoinedDate(): string {
    if (!this.joinedAt) return '';
    const date = new Date(this.joinedAt);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

export interface OrganizationRoleRecord {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isCustom?: boolean;
}

export type { SendInvitationDto, ChangeMemberRoleDto };
