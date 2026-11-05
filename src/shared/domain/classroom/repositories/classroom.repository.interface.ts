import type {
  Classroom,
  ClassroomLesson,
  ClassroomStudent,
  CreateClassroomInput,
  OrganizationSubject,
} from "../entities/classroom.entity";

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
  ): Promise<ClassroomLesson[]>;
  listSubjects(organizationId: string): Promise<OrganizationSubject[]>;
  create(organizationId: string, input: CreateClassroomInput): Promise<void>;
  scheduleLesson(organizationId: string, classroomId: string, input: { scheduledAt: string; durationMins: number; teacherId: string; isRecurring: boolean }): Promise<void>;
  listLearnerCandidates(organizationId: string, classroomId: string): Promise<Array<{ id: string; firstName: string; lastName: string; email: string; image: string | null }>>;
  addLearner(organizationId: string, classroomId: string, studentId: string): Promise<void>;
}
