import type {
  Classroom,
  ClassroomLesson,
  ClassroomRecurrence,
  ClassroomStudent,
  CreateClassroomInput,
  IClassroomRepository,
  OrganizationSubject,
} from "@/shared/domain";
import { classroomApi } from "../rest/classroom.api";

export class ClassroomRepository implements IClassroomRepository {
  async list(organizationId: string): Promise<Classroom[]> {
    const value = await classroomApi.list(organizationId);
    if (!Array.isArray(value))
      throw new Error("The API returned an invalid classroom response.");
    return value.map(toClassroom);
  }

  async get(organizationId: string, classroomId: string): Promise<Classroom> {
    return toClassroom(await classroomApi.get(organizationId, classroomId));
  }

  async listStudents(
    organizationId: string,
    classroomId: string,
  ): Promise<ClassroomStudent[]> {
    const value = await classroomApi.listStudents(organizationId, classroomId);
    if (!Array.isArray(value)) {
      throw new Error(
        "The API returned an invalid classroom learner response.",
      );
    }
    return value.map(toClassroomStudent);
  }

  async listLessons(
    organizationId: string,
    classroomId: string,
    range?: { fromDate?: string; toDate?: string },
  ): Promise<ClassroomLesson[]> {
    const value = await classroomApi.listLessons(
      organizationId,
      classroomId,
      range,
    );
    if (!Array.isArray(value)) {
      throw new Error("The API returned an invalid classroom lesson response.");
    }
    return value.map(toClassroomLesson);
  }

  async listSubjects(organizationId: string): Promise<OrganizationSubject[]> {
    const value = await classroomApi.listSubjects(organizationId);
    if (!Array.isArray(value))
      throw new Error("The API returned an invalid subject response.");
    return value.map(toOrganizationSubject);
  }

  async create(
    organizationId: string,
    input: CreateClassroomInput,
  ): Promise<void> {
    await classroomApi.create(organizationId, input);
  }

  async scheduleLesson(
    organizationId: string,
    classroomId: string,
    input: {
      scheduledAt: string;
      durationMins: number;
      teacherId?: string;
    },
  ): Promise<void> {
    await classroomApi.scheduleLesson(organizationId, classroomId, input);
  }
  async pause(organizationId: string, classroomId: string): Promise<void> {
    await classroomApi.pause(organizationId, classroomId);
  }
  async close(organizationId: string, classroomId: string): Promise<void> {
    await classroomApi.close(organizationId, classroomId);
  }
  async rescheduleLesson(
    organizationId: string,
    lessonId: string,
    input: { scheduledAt: string; durationMins?: number },
  ): Promise<void> {
    await classroomApi.rescheduleLesson(organizationId, lessonId, input);
  }
  async listLearnerCandidates(
    organizationId: string,
    classroomId: string,
  ): Promise<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      image: string | null;
    }>
  > {
    const value = await classroomApi.listLearnerCandidates(
      organizationId,
      classroomId,
    );
    if (!Array.isArray(value))
      throw new Error(
        "The API returned an invalid learner candidate response.",
      );
    return value
      .map(toLearnerProfile)
      .filter(
        (learner): learner is NonNullable<typeof learner> => learner !== null,
      );
  }
  async addLearner(
    organizationId: string,
    classroomId: string,
    studentId: string,
  ): Promise<void> {
    await classroomApi.addLearner(organizationId, classroomId, studentId);
  }
}

export const classroomRepository = new ClassroomRepository();

function toClassroom(value: unknown): Classroom {
  const classroom = record(value, "classroom");
  return {
    id: requiredString(classroom, "id"),
    organizationId: requiredString(classroom, "orgId"),
    name: requiredString(classroom, "name"),
    subjectId: requiredString(classroom, "subjectId"),
    primaryTeacherId: requiredString(classroom, "primaryTeacherId"),
    status: requiredString(classroom, "status"),
    lessonDurationMins: requiredNumber(classroom, "lessonDurationMins"),
    maxStudents: optionalNumber(classroom, "maxStudents"),
    recurrence: toRecurrence(classroom.recurrence),
    createdAt: requiredString(classroom, "createdAt"),
    updatedAt: requiredString(classroom, "updatedAt"),
  };
}

function toOrganizationSubject(value: unknown): OrganizationSubject {
  const subject = record(value, "subject");
  return {
    id: requiredString(subject, "id"),
    name: requiredString(subject, "name"),
  };
}

function toClassroomStudent(value: unknown): ClassroomStudent {
  const student = record(value, "classroom learner");
  return {
    id: requiredString(student, "id"),
    classroomId: requiredString(student, "classroomId"),
    organizationId: requiredString(student, "orgId"),
    studentId: requiredString(student, "studentId"),
    status: requiredString(student, "status"),
    enrolledAt: requiredString(student, "enrolledAt"),
    removedAt: optionalString(student, "removedAt"),
    learner: toLearnerProfile(student.learner),
  };
}

function toLearnerProfile(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const learner = value as Record<string, unknown>;
  return {
    id: requiredString(learner, "id"),
    firstName: requiredString(learner, "firstName"),
    lastName: requiredString(learner, "lastName"),
    email: requiredString(learner, "email"),
    image: optionalString(learner, "image"),
  };
}

function toClassroomLesson(value: unknown): ClassroomLesson {
  const lesson = record(value, "classroom lesson");
  return {
    id: requiredString(lesson, "id"),
    classroomId: requiredString(lesson, "classroomId"),
    teacherId: requiredString(lesson, "teacherId"),
    coverTeacherId: optionalString(lesson, "coverTeacherId"),
    scheduledAt: requiredString(lesson, "scheduledAt"),
    durationMins: requiredNumber(lesson, "durationMins"),
    status: requiredString(lesson, "status"),
    isRecurring:
      typeof lesson.isRecurring === "boolean" ? lesson.isRecurring : false,
    origin:
      typeof lesson.origin === "string"
        ? lesson.origin
        : "RECURRING_GENERATION",
  };
}

function toRecurrence(value: unknown): ClassroomRecurrence {
  const recurrence = record(value, "classroom recurrence");
  return {
    daysOfWeek: readDaysOfWeek(recurrence),
    startTime: requiredString(recurrence, "startTime"),
    timezone: requiredString(recurrence, "timezone"),
    intervalWeeks: optionalNumber(recurrence, "intervalWeeks") ?? 1,
    effectiveFrom: requiredString(recurrence, "effectiveFrom"),
    effectiveUntil: optionalString(recurrence, "effectiveUntil"),
  };
}

function readDaysOfWeek(value: Record<string, unknown>): number[] {
  const days = value.daysOfWeek;
  if (
    Array.isArray(days) &&
    days.length > 0 &&
    days.every((day) => typeof day === "number")
  ) {
    return days;
  }
  return [requiredNumber(value, "dayOfWeek")];
}

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`The API returned an invalid ${name}.`);
  return value as Record<string, unknown>;
}

function requiredString(value: Record<string, unknown>, key: string): string {
  if (typeof value[key] !== "string")
    throw new Error(`The API response is missing ${key}.`);
  return value[key];
}

function optionalString(
  value: Record<string, unknown>,
  key: string,
): string | null {
  return typeof value[key] === "string" ? value[key] : null;
}

function requiredNumber(value: Record<string, unknown>, key: string): number {
  if (typeof value[key] !== "number")
    throw new Error(`The API response is missing ${key}.`);
  return value[key];
}

function optionalNumber(
  value: Record<string, unknown>,
  key: string,
): number | null {
  return typeof value[key] === "number" ? value[key] : null;
}
