import { apiClient } from "@/shared/api";
import type {
  OrgReportsResponse,
  MissingReportLessonItem,
  CreateLessonReportPayload,
  UpdateLessonReportPayload,
  LessonReportDetail,
} from "@/shared/domain";

export interface OrgReportsFilter {
  status?: string;
  classroomId?: string;
  subjectId?: string;
  teacherId?: string;
  studentId?: string;
  attendanceStatus?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface MissingReportLessonsFilter {
  classroomId?: string;
  teacherId?: string;
  search?: string;
}

export const lessonReportsApi = {
  getOrgReports: async (
    orgId: string,
    filter?: OrgReportsFilter,
  ): Promise<OrgReportsResponse> => {
    const response = await apiClient.get<OrgReportsResponse>(
      `/orgs/${orgId}/reports`,
      { params: filter },
    );
    return response.data;
  },

  getMissingReportLessons: async (
    orgId: string,
    filter?: MissingReportLessonsFilter,
  ): Promise<MissingReportLessonItem[]> => {
    const response = await apiClient.get<MissingReportLessonItem[]>(
      `/orgs/${orgId}/reports/missing-lessons`,
      { params: filter },
    );
    return response.data;
  },

  getReport: async (
    orgId: string,
    reportId: string,
  ): Promise<LessonReportDetail> => {
    const response = await apiClient.get<LessonReportDetail>(
      `/orgs/${orgId}/reports/${reportId}`,
    );
    return response.data;
  },

  createReport: async (
    orgId: string,
    payload: CreateLessonReportPayload,
  ): Promise<{ reportId: string; status: string }> => {
    const response = await apiClient.post<{ reportId: string; status: string }>(
      `/orgs/${orgId}/reports`,
      payload,
    );
    return response.data;
  },

  updateReport: async (
    orgId: string,
    reportId: string,
    payload: UpdateLessonReportPayload,
  ): Promise<{ reportId: string; status: string }> => {
    const response = await apiClient.patch<{ reportId: string; status: string }>(
      `/orgs/${orgId}/reports/${reportId}`,
      payload,
    );
    return response.data;
  },

  approveAiSummary: async (
    orgId: string,
    reportId: string,
    editedSummary?: string,
  ): Promise<any> => {
    const response = await apiClient.post(
      `/orgs/${orgId}/reports/${reportId}/approve-ai`,
      { editedSummary },
    );
    return response.data;
  },

  submitReport: async (orgId: string, reportId: string): Promise<any> => {
    const response = await apiClient.post(
      `/orgs/${orgId}/reports/${reportId}/submit`,
    );
    return response.data;
  },

  addComment: async (
    orgId: string,
    reportId: string,
    content: string,
    parentCommentId?: string,
  ): Promise<any> => {
    const response = await apiClient.post(
      `/orgs/${orgId}/reports/${reportId}/comments`,
      { content, parentCommentId },
    );
    return response.data;
  },
};
