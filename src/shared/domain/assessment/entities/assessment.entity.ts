export type AssessmentStatus =
  | "pending_marking"
  | "partially_marked"
  | "fully_marked";

export interface AssessmentLearner {
  id: string;
  fullName: string;
  email: string;
  image: string | null;
}

export interface AssessmentLesson {
  id: string;
  scheduledAt: string;
  status: string;
  classroomId: string;
  classroomName: string | null;
  subjectId: string | null;
}

export interface AssessmentRecord {
  id: string;
  organizationId: string;
  lessonId: string;
  boardId: string;
  studentId: string;
  status: AssessmentStatus;
  totalMaxMarks: number;
  totalMarksAwarded: number | null;
  scorePercent: number | null;
  autoMarkedCount: number;
  teacherMarkedCount: number;
  pendingMarkCount: number;
  learner: AssessmentLearner | null;
  lesson: AssessmentLesson | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSummary {
  total: number;
  pendingMarking: number;
  partiallyMarked: number;
  fullyMarked: number;
  averageScorePercent: number | null;
}

export interface AssessmentFilter {
  status?: AssessmentStatus;
  lessonId?: string;
  boardId?: string;
  studentId?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface AssessmentList {
  items: AssessmentRecord[];
  total: number;
  skip: number;
  take: number | null;
}
