import { apiClient } from "@/shared/api";
import type {
  QuestionFilter,
  QuestionRecord,
  QuestionSummary,
} from "@/shared/domain";
import type { CreateQuestionDto, UpdateQuestionDto } from "@/shared/api/generated";

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

  create: (organizationId: string, input: CreateQuestionDto) =>
    apiClient
      .post<QuestionRecord>("/questions", input, {
        headers: { "x-organization-id": organizationId },
      })
      .then((res) => res.data),

  update: (
    organizationId: string,
    questionId: string,
    input: UpdateQuestionDto,
  ) =>
    apiClient
      .patch<QuestionRecord>(`/questions/${questionId}`, input, {
        headers: { "x-organization-id": organizationId },
      })
      .then((res) => res.data),

  publish: (organizationId: string, questionId: string) =>
    apiClient
      .post<{ success: boolean }>(
        `/questions/${questionId}/publish`,
        {},
        {
          headers: { "x-organization-id": organizationId },
        },
      )
      .then((res) => res.data),

  unpublish: (organizationId: string, questionId: string) =>
    apiClient
      .post<{ success: boolean }>(
        `/questions/${questionId}/unpublish`,
        {},
        {
          headers: { "x-organization-id": organizationId },
        },
      )
      .then((res) => res.data),

  delete: (organizationId: string, questionId: string) =>
    apiClient
      .delete(`/questions/${questionId}`, {
        headers: { "x-organization-id": organizationId },
      })
      .then((res) => res.data),
};
