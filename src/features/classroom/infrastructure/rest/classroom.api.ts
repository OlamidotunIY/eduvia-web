import { apiClient } from "@/shared/api";
import type { CreateClassroomInput } from "@/shared/domain";

export const classroomApi = {
  list: (organizationId: string) =>
    apiClient
      .get<unknown>(`/organizations/${organizationId}/classrooms`)
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
