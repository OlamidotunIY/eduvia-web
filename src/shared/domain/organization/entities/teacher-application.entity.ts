export type TeacherApplicationStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'auto_rejected';

export interface ApplicationUserSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  image: string | null;
  avatarUrl: string | null;
}

export interface ApplicationSubjectItem {
  id: string;
  name: string;
}

export interface TeacherApplicationRecord {
  id: string;
  orgId: string;
  applicantUserId: string;
  applicant: ApplicationUserSummary | null;
  appliedSubjects: string[];
  appliedSubjectDetails: ApplicationSubjectItem[];
  status: TeacherApplicationStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewer: ApplicationUserSummary | null;
  reviewedAt: string | null;
  coverLetter: string | null;
  qualifications: string | null;
  assignedRole: string | null;
  assignedRoleId: string | null;
  assignedRoleName: string | null;
  approvedSubjects: string[] | null;
  approvedSubjectDetails: ApplicationSubjectItem[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherApplicationSettings {
  organizationId: string;
  acceptingTeachers: boolean;
  marketplaceListed: boolean;
}

export interface ApplyToOrganizationInput {
  appliedSubjects: string[];
  coverLetter?: string | null;
  qualifications?: string | null;
}

export interface ApproveTeacherApplicationInput {
  approvedSubjects?: string[];
  role?: string;
  roleId?: string;
}

export interface RejectTeacherApplicationInput {
  reason?: string | null;
}
