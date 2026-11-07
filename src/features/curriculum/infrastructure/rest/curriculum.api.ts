import { apiClient } from "@/shared/api";

export const curriculumApi = {
  getOverview: (organizationId: string) =>
    apiClient
      .get<unknown>(`/organizations/${organizationId}/curriculum/overview`)
      .then((response) => response.data),

  getTree: (organizationId: string, curriculumId: string) =>
    apiClient
      .get<unknown>(
        `/organizations/${organizationId}/curriculum/${curriculumId}/tree`,
      )
      .then((response) => response.data),

  search: (organizationId: string, query: string, curriculumId?: string) =>
    apiClient
      .get<unknown>(`/organizations/${organizationId}/curriculum/search`, {
        params: {
          q: query,
          ...(curriculumId ? { curriculumId } : {}),
        },
      })
      .then((response) => response.data),
};
