import { apiClient } from "@/shared/api";
import type {
  OrgStudentsProgressResponse,
  StudentMasteryNode,
  LessonReportDetail,
} from "@/shared/domain";

export interface OrgProgressFilter {
  classroomId?: string;
  subjectId?: string;
  search?: string;
  masteryTier?: string;
}

export const studentProgressApi = {
  getOrgStudentsProgress: async (
    orgId: string,
    filter?: OrgProgressFilter,
  ): Promise<OrgStudentsProgressResponse> => {
    const response = await apiClient.get<OrgStudentsProgressResponse>(
      `/orgs/${orgId}/progress/students`,
      { params: filter },
    );
    return response.data;
  },

  getStudentProgress: async (
    studentId: string,
    orgId?: string,
    subjectId?: string,
  ): Promise<any[]> => {
    const response = await apiClient.get<any[]>(
      `/students/${studentId}/progress`,
      {
        params: { orgId, subjectId },
      },
    );
    return response.data;
  },

  getStudentMasteryGraph: async (
    studentId: string,
    orgId?: string,
  ): Promise<StudentMasteryNode[]> => {
    const response = await apiClient.get<StudentMasteryNode[]>(
      `/students/${studentId}/mastery-graph`,
      {
        params: { orgId },
      },
    );
    return response.data;
  },

  getStudentLessonHistory: async (
    studentId: string,
    orgId?: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<LessonReportDetail[]> => {
    const response = await apiClient.get<LessonReportDetail[]>(
      `/students/${studentId}/lesson-history`,
      {
        params: { orgId, ...pagination },
      },
    );
    return response.data;
  },

  applyMasteryOverride: async (
    studentId: string,
    nodeId: string,
    orgId: string,
    score: number,
  ): Promise<any> => {
    const response = await apiClient.post(
      `/students/${studentId}/mastery/${nodeId}/override`,
      { score },
      { params: { orgId } },
    );
    return response.data;
  },

  getLessonReport: async (
    orgId: string,
    reportId: string,
  ): Promise<LessonReportDetail> => {
    const response = await apiClient.get<LessonReportDetail>(
      `/orgs/${orgId}/reports/${reportId}`,
    );
    return response.data;
  },

  addReportComment: async (
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
