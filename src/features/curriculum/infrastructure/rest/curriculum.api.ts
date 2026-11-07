import { apiClient } from "@/shared/api";
import type {
  CreateCurriculumInput,
  CurriculumListFilter,
} from "@/shared/domain";

export const curriculumApi = {
  getOverview: (organizationId: string) =>
    apiClient
      .get<unknown>(`/organizations/${organizationId}/curriculum/overview`)
      .then((response) => response.data),

  listAll: (filter?: CurriculumListFilter) =>
    apiClient
      .get<unknown>("/curricula", {
        params: {
          ...(filter?.countryCode ? { countryCode: filter.countryCode } : {}),
          ...(filter?.isActive !== undefined ? { isActive: String(filter.isActive) } : {}),
        },
      })
      .then((response) => response.data),

  create: (data: CreateCurriculumInput) =>
    apiClient.post<unknown>("/curricula", data).then((response) => response.data),

  getById: (id: string) =>
    apiClient.get<unknown>(`/curricula/${id}`).then((response) => response.data),

  update: (id: string, data: Partial<CreateCurriculumInput>) =>
    apiClient.patch<unknown>(`/curricula/${id}`, data).then((response) => response.data),

  activate: (id: string) =>
    apiClient.post<unknown>(`/curricula/${id}/activate`).then((response) => response.data),

  deactivate: (id: string) =>
    apiClient.post<unknown>(`/curricula/${id}/deactivate`).then((response) => response.data),

  createNode: (curriculumId: string, data: any) =>
    apiClient
      .post<unknown>(`/curricula/${curriculumId}/nodes`, data)
      .then((response) => response.data),

  updateNode: (nodeId: string, data: any) =>
    apiClient
      .patch<unknown>(`/curriculum-nodes/${nodeId}`, data)
      .then((response) => response.data),

  deactivateNode: (nodeId: string) =>
    apiClient
      .post<unknown>(`/curriculum-nodes/${nodeId}/deactivate`)
      .then((response) => response.data),

  getTreeDirect: (curriculumId: string) =>
    apiClient
      .get<unknown>(`/curricula/${curriculumId}/tree`)
      .then((response) => response.data),

  getTree: (organizationId: string, curriculumId: string, preview?: boolean) =>
    apiClient
      .get<unknown>(
        `/organizations/${organizationId}/curriculum/${curriculumId}/tree`,
        {
          params: preview ? { preview: "true" } : undefined,
        },
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
