import type {
  Classroom,
  ClassroomLesson,
  ClassroomStudent,
  OrganizationSubject,
} from "../entities/classroom.entity";
import type {
  CreateClassroomDto,
  ScheduleLessonDto,
  RescheduleLessonDto,
} from "@/shared/api/generated";

export interface IClassroomRepository {
  list(organizationId: string): Promise<Classroom[]>;
  get(organizationId: string, classroomId: string): Promise<Classroom>;
  listStudents(
    organizationId: string,
    classroomId: string,
  ): Promise<ClassroomStudent[]>;
  listLessons(
    organizationId: string,
    classroomId: string,
    range?: { fromDate?: string; toDate?: string },
  ): Promise<ClassroomLesson[]>;
  listOrganizationLessons(
    organizationId: string,
    range: { fromDate: string; toDate: string },
  ): Promise<ClassroomLesson[]>;
  listSubjects(organizationId: string): Promise<OrganizationSubject[]>;
  create(organizationId: string, input: CreateClassroomDto): Promise<void>;
  scheduleLesson(
    organizationId: string,
    classroomId: string,
    input: ScheduleLessonDto,
  ): Promise<void>;
  rescheduleLesson(
    organizationId: string,
    lessonId: string,
    input: RescheduleLessonDto,
  ): Promise<void>;
  pause(organizationId: string, classroomId: string): Promise<void>;
  close(organizationId: string, classroomId: string): Promise<void>;
  listLearnerCandidates(
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
  >;
  addLearner(
    organizationId: string,
    classroomId: string,
    studentId: string,
  ): Promise<void>;
}
