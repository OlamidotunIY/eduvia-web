import { apiClient } from "@/shared/api";
import type {
  CreateQuestionInput,
  QuestionFilter,
  QuestionRecord,
  QuestionSummary,
  UpdateQuestionInput,
} from "../../domain";

export const questionApi = {
  search: (organizationId: string, filter?: QuestionFilter) =>
    apiClient
      .get<{ items: QuestionRecord[]; total: number }>("/questions", {
        params: { ...filter, orgId: organizationId },
        headers: { "x-organization-id": organizationId },
      })
      .then((res) => res.data),

  getSummary: (organizationId: string) =>
    apiClient
      .get<QuestionSummary>("/questions/summary", {
        params: { orgId: organizationId },
        headers: { "x-organization-id": organizationId },
      })
      .then((res) => res.data),

  getById: (organizationId: string, questionId: string) =>
    apiClient
      .get<QuestionRecord>(`/questions/${questionId}`, {
        params: { orgId: organizationId },
        headers: { "x-organization-id": organizationId },
      })
      .then((res) => res.data),

  create: (organizationId: string, input: CreateQuestionInput) =>
    apiClient
      .post<{ id: string }>("/questions", input, {
        headers: { "x-organization-id": organizationId },
      })
      .then((res) => res.data),

  update: (
    organizationId: string,
    questionId: string,
    input: UpdateQuestionInput,
  ) =>
    apiClient
      .patch<{ id: string }>(`/questions/${questionId}`, input, {
        headers: { "x-organization-id": organizationId },
      })
      .then((res) => res.data),

  publish: (organizationId: string, questionId: string) =>
    apiClient
      .post<{ id: string; isPublished: boolean }>(
        `/questions/${questionId}/publish`,
        {},
        {
          headers: { "x-organization-id": organizationId },
        },
      )
      .then((res) => res.data),

  unpublish: (organizationId: string, questionId: string) =>
    apiClient
      .post<{ id: string; isPublished: boolean }>(
        `/questions/${questionId}/unpublish`,
        {},
        {
          headers: { "x-organization-id": organizationId },
        },
      )
      .then((res) => res.data),

  delete: (organizationId: string, questionId: string) =>
    apiClient
      .delete<{ id: string; success: boolean }>(`/questions/${questionId}`, {
        headers: { "x-organization-id": organizationId },
      })
      .then((res) => res.data),
};
