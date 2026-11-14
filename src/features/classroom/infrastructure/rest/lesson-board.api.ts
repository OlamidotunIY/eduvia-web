import { apiClient } from "@/shared/api";
import type {
  BoardCanvasState,
  BoardMode,
  BoardSectionType,
} from "@/shared/domain";

export const lessonBoardApi = {
  getByLesson: (lessonId: string) =>
    apiClient
      .get<unknown>(`/boards/lessons/${lessonId}`)
      .then((res) => res.data),

  getById: (organizationId: string, boardId: string) =>
    apiClient
      .get<unknown>(`/organizations/${organizationId}/boards/${boardId}`)
      .then((res) => res.data),

  savePlan: (
    organizationId: string,
    boardId: string,
    input: {
      learningObjectives?: string[];
      topicsCovered?: string[];
      teachingNotes?: string | null;
      homeworkDescription?: string | null;
    },
  ) =>
    apiClient
      .post(`/organizations/${organizationId}/boards/${boardId}/plan`, input)
      .then(() => undefined),

  completePlan: (organizationId: string, boardId: string) =>
    apiClient
      .post(`/organizations/${organizationId}/boards/${boardId}/plan/complete`)
      .then(() => undefined),

  switchMode: (
    organizationId: string,
    boardId: string,
    input: { mode: BoardMode; lessonStatus?: string },
  ) =>
    apiClient
      .post(`/organizations/${organizationId}/boards/${boardId}/mode`, input)
      .then(() => undefined),

  lock: (organizationId: string, boardId: string) =>
    apiClient
      .post(`/organizations/${organizationId}/boards/${boardId}/lock`)
      .then(() => undefined),

  unlock: (organizationId: string, boardId: string) =>
    apiClient
      .post(`/organizations/${organizationId}/boards/${boardId}/unlock`)
      .then(() => undefined),

  importContent: (
    organizationId: string,
    boardId: string,
    sourceBoardId: string,
  ) =>
    apiClient
      .post(`/organizations/${organizationId}/boards/${boardId}/import`, {
        sourceBoardId,
      })
      .then((res) => res.data),

  addSection: (
    organizationId: string,
    boardId: string,
    input: {
      type: BoardSectionType;
      content: string;
      position?: number;
      isTeacherOnly?: boolean;
    },
  ) =>
    apiClient
      .post(
        `/organizations/${organizationId}/boards/${boardId}/sections`,
        input,
      )
      .then((res) => res.data),

  updateSection: (
    organizationId: string,
    boardId: string,
    sectionId: string,
    content: string,
  ) =>
    apiClient
      .patch(
        `/organizations/${organizationId}/boards/${boardId}/sections/${sectionId}`,
        { content },
      )
      .then((res) => res.data),

  removeSection: (organizationId: string, boardId: string, sectionId: string) =>
    apiClient
      .delete(
        `/organizations/${organizationId}/boards/${boardId}/sections/${sectionId}`,
      )
      .then(() => undefined),

  listQuestions: (organizationId: string, boardId: string) =>
    apiClient
      .get<unknown[]>(
        `/organizations/${organizationId}/boards/${boardId}/questions`,
      )
      .then((res) => res.data),

  attachQuestion: (
    organizationId: string,
    boardId: string,
    input: {
      questionId: string;
      position?: number;
      mode?: "classwork" | "assignment";
      maxMarks: number;
      showOptions?: boolean;
      dueAt?: string;
    },
  ) =>
    apiClient
      .post(
        `/organizations/${organizationId}/boards/${boardId}/questions`,
        input,
      )
      .then((res) => res.data),

  removeQuestion: (
    organizationId: string,
    boardId: string,
    boardQuestionId: string,
  ) =>
    apiClient
      .delete(
        `/organizations/${organizationId}/boards/${boardId}/questions/${boardQuestionId}`,
      )
      .then(() => undefined),

  getMyResponse: (boardId: string, boardQuestionId: string) =>
    apiClient
      .get<unknown | null>(
        `/boards/${boardId}/questions/${boardQuestionId}/responses/me`,
      )
      .then((res) => res.data),

  listResponses: (boardId: string, boardQuestionId: string) =>
    apiClient
      .get<unknown[]>(
        `/boards/${boardId}/questions/${boardQuestionId}/responses`,
      )
      .then((res) => res.data),

  submitResponse: (
    boardId: string,
    boardQuestionId: string,
    input: {
      responseType: "text" | "image" | "mcq";
      textContent?: string;
      imageUrl?: string;
      selectedOption?: string;
    },
  ) =>
    apiClient
      .post(
        `/boards/${boardId}/questions/${boardQuestionId}/responses`,
        input,
      )
      .then((res) => res.data),

  markResponse: (
    boardId: string,
    boardQuestionId: string,
    responseId: string,
    input: { marksAwarded: number; maxMarks: number; feedback?: string },
  ) =>
    apiClient
      .post(
        `/boards/${boardId}/questions/${boardQuestionId}/responses/${responseId}/mark`,
        input,
      )
      .then((res) => res.data),

  getUploadUrl: (
    boardId: string,
    input: { filename: string; contentType: string },
  ) =>
    apiClient
      .post<{ uploadUrl: string; fileUrl: string; expiresAt: string }>(
        `/boards/${boardId}/upload-url`,
        input,
      )
      .then((res) => res.data),

  saveCanvasState: (boardId: string, input: BoardCanvasState) =>
    apiClient
      .patch(`/boards/${boardId}/canvas`, input)
      .then((res) => res.data),
};
