import {
  lessonReportsApi,
  type OrgReportsFilter,
  type MissingReportLessonsFilter,
} from "../rest/lesson-reports.api";
import type {
  CreateLessonReportPayload,
  UpdateLessonReportPayload,
} from "@/shared/domain";

export const lessonReportsRepository = {
  getOrgReports: (orgId: string, filter?: OrgReportsFilter) =>
    lessonReportsApi.getOrgReports(orgId, filter),

  getMissingReportLessons: (
    orgId: string,
    filter?: MissingReportLessonsFilter,
  ) => lessonReportsApi.getMissingReportLessons(orgId, filter),

  getReport: (orgId: string, reportId: string) =>
    lessonReportsApi.getReport(orgId, reportId),

  createReport: (orgId: string, payload: CreateLessonReportPayload) =>
    lessonReportsApi.createReport(orgId, payload),

  updateReport: (
    orgId: string,
    reportId: string,
    payload: UpdateLessonReportPayload,
  ) => lessonReportsApi.updateReport(orgId, reportId, payload),

  approveAiSummary: (
    orgId: string,
    reportId: string,
    editedSummary?: string,
  ) => lessonReportsApi.approveAiSummary(orgId, reportId, editedSummary),

  submitReport: (orgId: string, reportId: string) =>
    lessonReportsApi.submitReport(orgId, reportId),

  addComment: (
    orgId: string,
    reportId: string,
    content: string,
    parentCommentId?: string,
  ) =>
    lessonReportsApi.addComment(orgId, reportId, content, parentCommentId),
};
