import type { CreateClassroomDto, UpdateClassroomDto } from "@/shared/api/generated";

export type ClassroomStatus = "active" | "paused" | "closed" | string;

export interface ClassroomRecurrence {
  daysOfWeek: number[];
  startTime: string;
  timezone: string;
  intervalWeeks: number;
  effectiveFrom: string;
  effectiveUntil: string | null;
}

export interface ClassroomProps {
  id: string;
  organizationId: string;
  name: string;
  subjectId: string;
  primaryTeacherId: string;
  status: ClassroomStatus;
  lessonDurationMins: number;
  maxStudents: number | null;
  recurrence: ClassroomRecurrence;
  createdAt: string;
  updatedAt: string;
}

export class Classroom {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly subjectId: string;
  readonly primaryTeacherId: string;
  readonly status: ClassroomStatus;
  readonly lessonDurationMins: number;
  readonly maxStudents: number | null;
  readonly recurrence: ClassroomRecurrence;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(props: ClassroomProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.subjectId = props.subjectId;
    this.primaryTeacherId = props.primaryTeacherId;
    this.status = props.status;
    this.lessonDurationMins = props.lessonDurationMins;
    this.maxStudents = props.maxStudents;
    this.recurrence = props.recurrence;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isActive(): boolean {
    return this.status === "active";
  }

  isPaused(): boolean {
    return this.status === "paused";
  }

  isClosed(): boolean {
    return this.status === "closed";
  }

  getFormattedDuration(): string {
    return `${this.lessonDurationMins} mins`;
  }
}

export interface OrganizationSubjectProps {
  id: string;
  name: string;
}

export class OrganizationSubject {
  readonly id: string;
  readonly name: string;

  constructor(props: OrganizationSubjectProps) {
    this.id = props.id;
    this.name = props.name;
  }
}

export interface LearnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
}

export interface ClassroomStudentProps {
  id: string;
  classroomId: string;
  organizationId: string;
  studentId: string;
  status: string;
  enrolledAt: string;
  removedAt: string | null;
  learner: LearnerProfile | null;
}

export class ClassroomStudent {
  readonly id: string;
  readonly classroomId: string;
  readonly organizationId: string;
  readonly studentId: string;
  readonly status: string;
  readonly enrolledAt: string;
  readonly removedAt: string | null;
  readonly learner: LearnerProfile | null;

  constructor(props: ClassroomStudentProps) {
    this.id = props.id;
    this.classroomId = props.classroomId;
    this.organizationId = props.organizationId;
    this.studentId = props.studentId;
    this.status = props.status;
    this.enrolledAt = props.enrolledAt;
    this.removedAt = props.removedAt;
    this.learner = props.learner;
  }

  getDisplayName(): string {
    if (!this.learner) return "Student";
    const fullName = `${this.learner.firstName ?? ""} ${this.learner.lastName ?? ""}`.trim();
    return fullName || this.learner.email || "Student";
  }

  getInitials(): string {
    if (!this.learner) return "ST";
    const first = this.learner.firstName?.[0] ?? "";
    const last = this.learner.lastName?.[0] ?? "";
    return (first + last).toUpperCase() || "ST";
  }

  isEnrolled(): boolean {
    return this.status === "enrolled" || !this.removedAt;
  }
}

export interface ClassroomLessonProps {
  id: string;
  orgId?: string;
  classroomId: string;
  teacherId: string;
  coverTeacherId: string | null;
  scheduledAt: string;
  durationMins: number;
  status: string;
  isRecurring: boolean;
  origin: "RECURRING_GENERATION" | "ONE_OFF" | string;
  meetLink?: string | null;
  videoProvider?: string | null;
  cancelledReason?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  reportedAt?: string | null;
  noShowAt?: string | null;
  noShowType?: string | null;
}

export class ClassroomLesson {
  readonly id: string;
  readonly orgId?: string;
  readonly classroomId: string;
  readonly teacherId: string;
  readonly coverTeacherId: string | null;
  readonly scheduledAt: string;
  readonly durationMins: number;
  readonly status: string;
  readonly isRecurring: boolean;
  readonly origin: "RECURRING_GENERATION" | "ONE_OFF" | string;
  readonly meetLink: string | null;
  readonly videoProvider: string | null;
  readonly cancelledReason: string | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly reportedAt: string | null;
  readonly noShowAt: string | null;
  readonly noShowType: string | null;

  constructor(props: ClassroomLessonProps) {
    this.id = props.id;
    this.orgId = props.orgId;
    this.classroomId = props.classroomId;
    this.teacherId = props.teacherId;
    this.coverTeacherId = props.coverTeacherId;
    this.scheduledAt = props.scheduledAt;
    this.durationMins = props.durationMins;
    this.status = props.status;
    this.isRecurring = props.isRecurring;
    this.origin = props.origin;
    this.meetLink = props.meetLink ?? null;
    this.videoProvider = props.videoProvider ?? null;
    this.cancelledReason = props.cancelledReason ?? null;
    this.startedAt = props.startedAt ?? null;
    this.completedAt = props.completedAt ?? null;
    this.reportedAt = props.reportedAt ?? null;
    this.noShowAt = props.noShowAt ?? null;
    this.noShowType = props.noShowType ?? null;
  }

  isLive(): boolean {
    return this.status.toUpperCase() === "LIVE";
  }

  isScheduled(): boolean {
    return this.status.toUpperCase() === "SCHEDULED";
  }

  isEnded(): boolean {
    return ["COMPLETED", "MARKING", "REPORTED", "ARCHIVED"].includes(
      this.status.toUpperCase(),
    );
  }

  isCancelled(): boolean {
    return this.status.toLowerCase() === "cancelled";
  }

  isUpcoming(): boolean {
    return new Date(this.scheduledAt).getTime() > Date.now();
  }

  getFormattedTime(): string {
    const date = new Date(this.scheduledAt);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
}

export type { CreateClassroomDto, UpdateClassroomDto };
