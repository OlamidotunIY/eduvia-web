import type {
  Classroom,
  CreateClassroomInput,
  OrganizationSubject,
} from "../entities/classroom.entity";

export interface IClassroomRepository {
  list(organizationId: string): Promise<Classroom[]>;
  listSubjects(organizationId: string): Promise<OrganizationSubject[]>;
  create(organizationId: string, input: CreateClassroomInput): Promise<void>;
}
