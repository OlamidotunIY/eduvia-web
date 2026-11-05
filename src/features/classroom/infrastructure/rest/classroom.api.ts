import { apiClient } from "@/shared/api";
import type { CreateClassroomInput } from "@/shared/domain";

export const classroomApi = {
  list: (organizationId: string) =>
    apiClient
      .get<unknown>(`/organizations/${organizationId}/classrooms`)
      .then((response) => response.data),

  get: (organizationId: string, classroomId: string) =>
    apiClient
      .get<unknown>(
        `/organizations/${organizationId}/classrooms/${classroomId}`,
      )
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

  scheduleLesson: (
    organizationId: string,
    classroomId: string,
    input: {
      scheduledAt: string;
      durationMins: number;
      teacherId: string;
      isRecurring: boolean;
    },
  ) =>
    apiClient
      .post(
        `/organizations/${organizationId}/classrooms/${classroomId}/schedule-lesson`,
        input,
      )
      .then(() => undefined),

  listLearnerCandidates: (organizationId: string, classroomId: string) =>
    apiClient
      .get<unknown>(
        `/organizations/${organizationId}/classrooms/${classroomId}/learner-candidates`,
      )
      .then((response) => response.data),

  addLearner: (
    organizationId: string,
    classroomId: string,
    studentId: string,
  ) =>
    apiClient
      .post(
        `/organizations/${organizationId}/classrooms/${classroomId}/students`,
        { studentId },
      )
      .then(() => undefined),
};
