export type ClassroomStatus = "active" | "paused" | "closed" | string;

export interface ClassroomRecurrence {
  daysOfWeek: number[];
  startTime: string;
  timezone: string;
  intervalWeeks: number;
  effectiveFrom: string;
  effectiveUntil: string | null;
}

export interface Classroom {
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

export interface OrganizationSubject {
  id: string;
  name: string;
}

export interface ClassroomStudent {
  id: string;
  classroomId: string;
  organizationId: string;
  studentId: string;
  status: string;
  enrolledAt: string;
  removedAt: string | null;
  learner: LearnerProfile | null;
}

export interface LearnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
}

export interface ClassroomLesson {
  id: string;
  classroomId: string;
  teacherId: string;
  coverTeacherId: string | null;
  scheduledAt: string;
  durationMins: number;
  status: string;
  isRecurring: boolean;
}

export interface CreateClassroomInput {
  name: string;
  subjectId: string;
  primaryTeacherId: string;
  lessonDurationMins: number;
  maxStudents?: number;
  recurrenceDaysOfWeek: number[];
  recurrenceStartTime: string;
  recurrenceTimezone: string;
  recurrenceIntervalWeeks?: number;
  recurrenceEffectiveFrom: string;
  recurrenceEffectiveUntil?: string | null;
}
