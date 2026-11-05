import { apiClient } from "@/shared/api";
import type { CreateClassroomInput } from "@/shared/domain";

export const classroomApi = {
  list: (organizationId: string) =>
    apiClient
      .get<unknown>(`/organizations/${organizationId}/classrooms`)
      .then((response) => response.data),

  get: (organizationId: string, classroomId: string) =>
    apiClient
      .get<unknown>(`/organizations/${organizationId}/classrooms/${classroomId}`)
      .then((response) => response.data),

  listStudents: (organizationId: string, classroomId: string) =>
    apiClient
      .get<unknown>(
        `/organizations/${organizationId}/classrooms/${classroomId}/students`,
      )
      .then((response) => response.data),

  listLessons: (organizationId: string, classroomId: string) =>
    apiClient
      .get<unknown>(
        `/organizations/${organizationId}/classrooms/${classroomId}/lessons`,
      )
      .then((response) => response.data),

  listSubjects: (organizationId: string) =>
    apiClient
      .get<unknown>(`/organizations/${organizationId}/subjects`, {
        params: { activeOnly: "true" },
      })
      .then((response) => response.data),

  create: (organizationId: string, input: CreateClassroomInput) =>
    apiClient
      .post(`/organizations/${organizationId}/classrooms`, input)
      .then(() => undefined),
};
