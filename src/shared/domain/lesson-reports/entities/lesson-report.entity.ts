export type ReportStatus =
  | "draft"
  | "ai_draft"
  | "teacher_reviewing"
  | "submitted"
  | "archived";

export type ReportAttendanceStatus =
  | "attended"
  | "absent"
  | "late"
  | "no_show";

export interface OrgReportItem {
  id: string;
  lessonId: string;
  classroomId: string;
  classroomName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string | null;
  status: ReportStatus;
  attendanceStatus: ReportAttendanceStatus;
  overallRating?: number | null;
  scorePercent?: number | null;
  parentCanView: boolean;
  hasAiSummary: boolean;
  isAiApproved: boolean;
  commentsCount: number;
  lessonScheduledAt?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrgReportsFilterOption {
  id: string;
  name: string;
}

export interface OrgReportsMeta {
  total: number;
  totalDraft: number;
  totalNeedsReview: number;
  totalSubmitted: number;
  totalMissingLessons: number;
  averageRating?: number | null;
  classrooms: OrgReportsFilterOption[];
  subjects: OrgReportsFilterOption[];
}

export interface OrgReportsResponse {
  reports: OrgReportItem[];
  meta: OrgReportsMeta;
}

export interface MissingReportLessonStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
}

export interface MissingReportLessonItem {
  lessonId: string;
  classroomId: string;
  classroomName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string | null;
  scheduledAt: string;
  durationMins: number;
  status: string;
  students: MissingReportLessonStudent[];
}

export interface CreateLessonReportPayload {
  lessonId: string;
  classroomId: string;
  teacherId: string;
  studentId: string;
  topicNodeIds?: string[];
  attendanceStatus?: ReportAttendanceStatus;
  teacherNarrative?: string;
  homeworkSet?: string;
  nextSteps?: string;
  overallRating?: number;
}

export interface UpdateLessonReportPayload {
  teacherNarrative?: string;
  topicNodeIds?: string[];
  attendanceStatus?: ReportAttendanceStatus;
  homeworkSet?: string | null;
  nextSteps?: string | null;
  overallRating?: number | null;
  parentCanView?: boolean;
}
