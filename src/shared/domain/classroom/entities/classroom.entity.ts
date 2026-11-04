export type ClassroomStatus = "active" | "paused" | "closed" | string;

export interface ClassroomRecurrence {
  dayOfWeek: number;
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

export interface CreateClassroomInput {
  name: string;
  subjectId: string;
  primaryTeacherId: string;
  lessonDurationMins: number;
  maxStudents?: number;
  recurrenceDayOfWeek: number;
  recurrenceStartTime: string;
  recurrenceTimezone: string;
  recurrenceIntervalWeeks?: number;
  recurrenceEffectiveFrom: string;
  recurrenceEffectiveUntil?: string | null;
}
