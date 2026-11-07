import {
  Classroom,
  ClassroomLesson,
  type ClassroomRecurrence,
  ClassroomStudent,
  type IClassroomRepository,
  OrganizationSubject,
  type LearnerProfile,
} from "@/shared/domain";
import type {
  CreateClassroomDto,
  ScheduleLessonDto,
  RescheduleLessonDto,
} from "@/shared/api/generated";
import { classroomApi } from "../rest/classroom.api";

export class ClassroomRepository implements IClassroomRepository {
  async list(organizationId: string): Promise<Classroom[]> {
    const value = await classroomApi.list(organizationId);
    if (!Array.isArray(value))
      throw new Error("The API returned an invalid classroom response.");
    return value.map((item) => this.toClassroom(item));
  }

  async get(organizationId: string, classroomId: string): Promise<Classroom> {
    return this.toClassroom(await classroomApi.get(organizationId, classroomId));
  }

  async listStudents(
    organizationId: string,
    classroomId: string,
  ): Promise<ClassroomStudent[]> {
    const value = await classroomApi.listStudents(organizationId, classroomId);
    if (!Array.isArray(value)) {
      throw new Error(
        "The API returned an invalid classroom students response.",
      );
    }
    return value.map((item) => this.toClassroomStudent(item));
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
    return value.map((item) => this.toClassroomLesson(item));
  }

  async listOrganizationLessons(
    organizationId: string,
    range: { fromDate: string; toDate: string },
  ): Promise<ClassroomLesson[]> {
    const value = await classroomApi.listOrganizationLessons(
      organizationId,
      range,
    );
    if (!Array.isArray(value)) {
      throw new Error(
        "The API returned an invalid organization lesson response.",
      );
    }
    return value.map((item) => this.toClassroomLesson(item));
  }

  async listSubjects(organizationId: string): Promise<OrganizationSubject[]> {
    const value = await classroomApi.listSubjects(organizationId);
    if (!Array.isArray(value)) {
      throw new Error("The API returned an invalid subject response.");
    }
    return value.map((item) => this.toOrganizationSubject(item));
  }

  async create(organizationId: string, input: CreateClassroomDto): Promise<void> {
    await classroomApi.create(organizationId, input);
  }

  async pause(organizationId: string, classroomId: string): Promise<void> {
    await classroomApi.pause(organizationId, classroomId);
  }

  async close(organizationId: string, classroomId: string): Promise<void> {
    await classroomApi.close(organizationId, classroomId);
  }

  async scheduleLesson(
    organizationId: string,
    classroomId: string,
    input: ScheduleLessonDto,
  ): Promise<void> {
    await classroomApi.scheduleLesson(organizationId, classroomId, input);
  }

  async rescheduleLesson(
    organizationId: string,
    lessonId: string,
    input: RescheduleLessonDto,
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
    if (!Array.isArray(value)) {
      throw new Error(
        "The API returned an invalid learner candidates response.",
      );
    }
    return value.map((item) => this.toLearnerProfile(item));
  }

  async addLearner(
    organizationId: string,
    classroomId: string,
    studentId: string,
  ): Promise<void> {
    await classroomApi.addLearner(organizationId, classroomId, studentId);
  }

  private toClassroom(value: unknown): Classroom {
    const classroom = this.record(value, "classroom");
    return new Classroom({
      id: this.requiredString(classroom, "id"),
      organizationId: this.requiredString(classroom, "orgId"),
      name: this.requiredString(classroom, "name"),
      subjectId: this.requiredString(classroom, "subjectId"),
      primaryTeacherId: this.requiredString(classroom, "primaryTeacherId"),
      status: this.requiredString(classroom, "status"),
      lessonDurationMins: this.requiredNumber(classroom, "lessonDurationMins"),
      maxStudents: this.optionalNumber(classroom, "maxStudents"),
      recurrence: this.toRecurrence(classroom.recurrence),
      createdAt: this.requiredString(classroom, "createdAt"),
      updatedAt: this.requiredString(classroom, "updatedAt"),
    });
  }

  private toOrganizationSubject(value: unknown): OrganizationSubject {
    const subject = this.record(value, "organization subject");
    return new OrganizationSubject({
      id: this.requiredString(subject, "id"),
      name: this.requiredString(subject, "name"),
    });
  }

  private toClassroomStudent(value: unknown): ClassroomStudent {
    const student = this.record(value, "classroom student");
    return new ClassroomStudent({
      id: this.requiredString(student, "id"),
      classroomId: this.requiredString(student, "classroomId"),
      organizationId: this.requiredString(student, "orgId"),
      studentId: this.requiredString(student, "studentId"),
      status: this.requiredString(student, "status"),
      enrolledAt: this.requiredString(student, "enrolledAt"),
      removedAt: this.optionalString(student, "removedAt"),
      learner: student.learner ? this.toLearnerProfile(student.learner) : null,
    });
  }

  private toLearnerProfile(value: unknown): LearnerProfile {
    const learner = this.record(value, "learner");
    return {
      id: this.requiredString(learner, "id"),
      firstName: this.requiredString(learner, "firstName"),
      lastName: this.requiredString(learner, "lastName"),
      email: this.requiredString(learner, "email"),
      image: this.optionalString(learner, "image"),
    };
  }

  private toClassroomLesson(value: unknown): ClassroomLesson {
    const lesson = this.record(value, "classroom lesson");
    return new ClassroomLesson({
      id: this.requiredString(lesson, "id"),
      classroomId: this.requiredString(lesson, "classroomId"),
      teacherId: this.requiredString(lesson, "teacherId"),
      coverTeacherId: this.optionalString(lesson, "coverTeacherId"),
      scheduledAt: this.requiredString(lesson, "scheduledAt"),
      durationMins: this.requiredNumber(lesson, "durationMins"),
      status: this.requiredString(lesson, "status"),
      isRecurring: Boolean(lesson.isRecurring),
      origin: this.requiredString(lesson, "origin"),
    });
  }

  private toRecurrence(value: unknown): ClassroomRecurrence {
    const recurrence = this.record(value, "recurrence");
    return {
      daysOfWeek: this.readDaysOfWeek(recurrence),
      startTime: this.requiredString(recurrence, "startTime"),
      timezone: this.requiredString(recurrence, "timezone"),
      intervalWeeks: this.requiredNumber(recurrence, "intervalWeeks"),
      effectiveFrom: this.requiredString(recurrence, "effectiveFrom"),
      effectiveUntil: this.optionalString(recurrence, "effectiveUntil"),
    };
  }

  private readDaysOfWeek(value: Record<string, unknown>): number[] {
    const days = value.daysOfWeek;
    if (
      Array.isArray(days) &&
      days.every((day) => typeof day === "number" && Number.isInteger(day))
    ) {
      return days;
    }
    const day = value.dayOfWeek;
    if (typeof day === "number" && Number.isInteger(day)) {
      return [day];
    }
    throw new Error("Recurrence daysOfWeek must be an array of integers.");
  }

  private record(value: unknown, name: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`The API returned an invalid ${name}.`);
    }
    return value as Record<string, unknown>;
  }

  private requiredString(value: Record<string, unknown>, key: string): string {
    const field = value[key];
    if (typeof field !== "string")
      throw new Error(`The API response is missing ${key}.`);
    return field;
  }

  private optionalString(
    value: Record<string, unknown>,
    key: string,
  ): string | null {
    const field = value[key];
    return typeof field === "string" ? field : null;
  }

  private requiredNumber(value: Record<string, unknown>, key: string): number {
    const field = value[key];
    if (typeof field !== "number" || !Number.isFinite(field)) {
      throw new Error(`The API response is missing a valid numeric ${key}.`);
    }
    return field;
  }

  private optionalNumber(
    value: Record<string, unknown>,
    key: string,
  ): number | null {
    const field = value[key];
    return typeof field === "number" && Number.isFinite(field) ? field : null;
  }
}

export const classroomRepository = new ClassroomRepository();
