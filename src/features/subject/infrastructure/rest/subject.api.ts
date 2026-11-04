import { apiClient } from "@/shared/api";
import type { OrganizationSubjectInput } from "@/shared/domain";

export const subjectApi = {
  listOrganizationSubjects: (organizationId: string) =>
    apiClient
      .get<unknown>(`/organizations/${organizationId}/subjects`)
      .then((response) => response.data),

  listPlatformSubjects: () =>
    apiClient
      .get<unknown>("/platform-subjects", { params: { activeOnly: "true" } })
      .then((response) => response.data),

  create: (organizationId: string, input: OrganizationSubjectInput) =>
    apiClient
      .post(`/organizations/${organizationId}/subjects`, input)
      .then(() => undefined),

  update: (
    organizationId: string,
    subjectId: string,
    input: OrganizationSubjectInput,
  ) =>
    apiClient
      .patch(`/organizations/${organizationId}/subjects/${subjectId}`, input)
      .then(() => undefined),
};
