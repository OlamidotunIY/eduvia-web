export type MasteryTier = 'Mastered' | 'Proficient' | 'In Progress' | 'Needs Support';

export interface StudentClassroomInfo {
  id: string;
  name: string;
  subjectId: string;
}

export interface StudentProgressMetrics {
  totalLessonsAttended: number;
  totalLessonsMissed: number;
  totalAssessments: number;
  averageScorePercent: number | null;
  masteredTopicsCount: number;
  inProgressTopicsCount: number;
  notStartedTopicsCount: number;
  overallMasteryLevel: number | null;
  masteryTier: MasteryTier;
  lastLessonAt: string | null;
  lastUpdatedAt: string | null;
}

export interface OrgStudentProgressItem {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  gradeLevel: string | null;
  classrooms: StudentClassroomInfo[];
  summary: StudentProgressMetrics;
}

export interface OrgStudentsProgressMeta {
  totalStudents: number;
  averageMasteryRate: number;
  totalLessonsAttended: number;
  studentsNeedingSupport: number;
  classrooms: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
}

export interface OrgStudentsProgressResponse {
  students: OrgStudentProgressItem[];
  meta: OrgStudentsProgressMeta;
}

export interface StudentMasteryNode {
  nodeId: string;
  topicName?: string;
  subjectName?: string;
  curriculumCode?: string;
  score: number;
  status: 'mastered' | 'in_progress' | 'not_started';
  confidenceScore?: number;
  lastEvaluatedAt?: string;
  overriddenBy?: string | null;
  overrideReason?: string | null;
}

export interface LessonReportComment {
  id: string;
  reportId: string;
  authorId: string;
  authorRole: 'parent' | 'admin' | 'teacher';
  authorName?: string;
  authorAvatar?: string;
  content: string;
  parentCommentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonReportDetail {
  id: string;
  lessonId: string;
  orgId: string;
  classroomId: string;
  classroomName?: string;
  teacherId: string;
  teacherName?: string;
  teacherAvatar?: string;
  studentId: string;
  status: string;
  topicNodeIds: string[];
  attendanceStatus: 'attended' | 'absent' | 'late' | 'no_show';
  teacherNarrative: string | null;
  aiGeneratedSummary: string | null;
  teacherApprovedAiSummary: string | null;
  homeworkSet: string | null;
  nextSteps: string | null;
  overallRating: number | null;
  parentCanView: boolean;
  scorePercent: number | null;
  assessmentSummary?: {
    totalAttempted: number;
    totalCorrect: number;
    scorePercent: number;
    marksAwarded?: number;
    maxMarks?: number;
  };
  comments: LessonReportComment[];
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
