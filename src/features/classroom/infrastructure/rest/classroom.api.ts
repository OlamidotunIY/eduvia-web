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

  listLessons: (
    organizationId: string,
    classroomId: string,
    range?: { fromDate?: string; toDate?: string },
  ) =>
    apiClient
      .get<unknown>(
        `/organizations/${organizationId}/classrooms/${classroomId}/lessons`,
        {
          params: range,
        },
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

  pause: (organizationId: string, classroomId: string) =>
    apiClient
      .post(`/organizations/${organizationId}/classrooms/${classroomId}/pause`)
      .then(() => undefined),

  close: (organizationId: string, classroomId: string) =>
    apiClient
      .post(`/organizations/${organizationId}/classrooms/${classroomId}/close`)
      .then(() => undefined),

  scheduleLesson: (
    organizationId: string,
    classroomId: string,
    input: {
      scheduledAt: string;
      durationMins: number;
      teacherId?: string;
    },
  ) =>
    apiClient
      .post(
        `/organizations/${organizationId}/classrooms/${classroomId}/schedule-lesson`,
        input,
      )
      .then(() => undefined),

  rescheduleLesson: (
    organizationId: string,
    lessonId: string,
    input: { scheduledAt: string; durationMins?: number },
  ) =>
    apiClient
      .patch(
        `/organizations/${organizationId}/lessons/${lessonId}/reschedule`,
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
