import type {
  Classroom,
  ClassroomRecurrence,
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
