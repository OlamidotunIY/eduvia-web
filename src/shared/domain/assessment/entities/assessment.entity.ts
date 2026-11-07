import type { CreateAssessmentDto } from "@/shared/api/generated";

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

export interface AssessmentRecordProps {
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

export class AssessmentRecord {
  readonly id: string;
  readonly organizationId: string;
  readonly lessonId: string;
  readonly boardId: string;
  readonly studentId: string;
  readonly status: AssessmentStatus;
  readonly totalMaxMarks: number;
  readonly totalMarksAwarded: number | null;
  readonly scorePercent: number | null;
  readonly autoMarkedCount: number;
  readonly teacherMarkedCount: number;
  readonly pendingMarkCount: number;
  readonly learner: AssessmentLearner | null;
  readonly lesson: AssessmentLesson | null;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(props: AssessmentRecordProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.lessonId = props.lessonId;
    this.boardId = props.boardId;
    this.studentId = props.studentId;
    this.status = props.status;
    this.totalMaxMarks = props.totalMaxMarks;
    this.totalMarksAwarded = props.totalMarksAwarded;
    this.scorePercent = props.scorePercent;
    this.autoMarkedCount = props.autoMarkedCount;
    this.teacherMarkedCount = props.teacherMarkedCount;
    this.pendingMarkCount = props.pendingMarkCount;
    this.learner = props.learner;
    this.lesson = props.lesson;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isFullyMarked(): boolean {
    return this.status === "fully_marked";
  }

  isPendingMarking(): boolean {
    return this.status === "pending_marking";
  }

  getLearnerName(): string {
    return this.learner?.fullName || this.learner?.email || "Student";
  }

  getScoreDisplay(): string {
    if (this.totalMarksAwarded == null) return "Pending";
    return `${this.totalMarksAwarded} / ${this.totalMaxMarks}`;
  }
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
  take?: number | null;
}

export type { CreateAssessmentDto };
