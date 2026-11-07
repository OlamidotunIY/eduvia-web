import { apiClient } from "@/shared/api";
import type { AssessmentFilter } from "@/shared/domain";

export const assessmentApi = {
  list: (organizationId: string, filter?: AssessmentFilter) =>
    apiClient
      .get<unknown>(`/orgs/${organizationId}/assessments`, { params: filter })
      .then((response) => response.data),
  getSummary: (organizationId: string, filter?: AssessmentFilter) =>
    apiClient
      .get<unknown>(`/orgs/${organizationId}/assessments/summary`, {
        params: filter,
      })
      .then((response) => response.data),
};
