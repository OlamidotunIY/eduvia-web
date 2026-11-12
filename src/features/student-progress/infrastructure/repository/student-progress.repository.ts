import { studentProgressApi, type OrgProgressFilter } from '../rest/student-progress.api';
import type {
  OrgStudentsProgressResponse,
  StudentMasteryNode,
  LessonReportDetail,
} from '@/shared/domain';

export class StudentProgressRepository {
  async getOrgStudentsProgress(
    orgId: string,
    filter?: OrgProgressFilter,
  ): Promise<OrgStudentsProgressResponse> {
    return studentProgressApi.getOrgStudentsProgress(orgId, filter);
  }

  async getStudentProgress(
    studentId: string,
    orgId?: string,
    subjectId?: string,
  ): Promise<any[]> {
    return studentProgressApi.getStudentProgress(studentId, orgId, subjectId);
  }

  async getStudentMasteryGraph(
    studentId: string,
    orgId?: string,
  ): Promise<StudentMasteryNode[]> {
    return studentProgressApi.getStudentMasteryGraph(studentId, orgId);
  }

  async getStudentLessonHistory(
    studentId: string,
    orgId?: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<LessonReportDetail[]> {
    return studentProgressApi.getStudentLessonHistory(studentId, orgId, pagination);
  }

  async applyMasteryOverride(
    studentId: string,
    nodeId: string,
    orgId: string,
    score: number,
  ): Promise<any> {
    return studentProgressApi.applyMasteryOverride(studentId, nodeId, orgId, score);
  }

  async getLessonReport(
    orgId: string,
    reportId: string,
  ): Promise<LessonReportDetail> {
    return studentProgressApi.getLessonReport(orgId, reportId);
  }

  async addReportComment(
    orgId: string,
    reportId: string,
    content: string,
    parentCommentId?: string,
  ): Promise<any> {
    return studentProgressApi.addReportComment(orgId, reportId, content, parentCommentId);
  }
}

export const studentProgressRepository = new StudentProgressRepository();
