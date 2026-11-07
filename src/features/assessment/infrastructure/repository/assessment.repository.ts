import {
  type AssessmentFilter,
  type AssessmentList,
  AssessmentRecord,
  type AssessmentStatus,
  type AssessmentSummary,
  type IAssessmentRepository,
} from "@/shared/domain";
import { assessmentApi } from "../rest/assessment.api";

export class AssessmentRepository implements IAssessmentRepository {
  async list(
    organizationId: string,
    filter?: AssessmentFilter,
  ): Promise<AssessmentList> {
    const value = this.record(await assessmentApi.list(organizationId, filter));
    if (!Array.isArray(value.items)) {
      throw new Error("The API returned an invalid assessment list.");
    }

    return {
      items: value.items.map((item) => this.toAssessment(item)),
      total: this.number(value.total, "assessment total"),
      skip: this.optionalNumber(value.skip) ?? 0,
      take: this.optionalNumber(value.take),
    };
  }

  async getSummary(
    organizationId: string,
    filter?: AssessmentFilter,
  ): Promise<AssessmentSummary> {
    const value = this.record(await assessmentApi.getSummary(organizationId, filter));
    return {
      total: this.number(value.total, "assessment summary total"),
      pendingMarking: this.number(value.pendingMarking, "pending marking count"),
      partiallyMarked: this.number(value.partiallyMarked, "partially marked count"),
      fullyMarked: this.number(value.fullyMarked, "fully marked count"),
      averageScorePercent: this.optionalNumber(value.averageScorePercent),
    };
  }

  private toAssessment(value: unknown): AssessmentRecord {
    const assessment = this.record(value);
    return new AssessmentRecord({
      id: this.string(assessment.id, "assessment id"),
      organizationId: this.string(assessment.orgId, "assessment organization id"),
      lessonId: this.string(assessment.lessonId, "assessment lesson id"),
      boardId: this.string(assessment.boardId, "assessment board id"),
      studentId: this.string(assessment.studentId, "assessment learner id"),
      status: this.assessmentStatus(assessment.status),
      totalMaxMarks: this.number(assessment.totalMaxMarks, "assessment total marks"),
      totalMarksAwarded: this.optionalNumber(assessment.totalMarksAwarded),
      scorePercent: this.optionalNumber(assessment.scorePercent),
      autoMarkedCount: this.number(assessment.autoMarkedCount, "auto marked count"),
      teacherMarkedCount: this.number(
        assessment.teacherMarkedCount,
        "teacher marked count",
      ),
      pendingMarkCount: this.number(
        assessment.pendingMarkCount,
        "pending marking count",
      ),
      learner: assessment.learner
        ? {
            id: this.string(
              this.record(assessment.learner).id,
              "learner id",
            ),
            fullName: this.string(
              this.record(assessment.learner).fullName,
              "learner name",
            ),
            email: this.string(
              this.record(assessment.learner).email,
              "learner email",
            ),
            image: this.optionalString(
              this.record(assessment.learner).image,
            ),
          }
        : null,
      lesson: assessment.lesson
        ? {
            id: this.string(
              this.record(assessment.lesson).id,
              "lesson id",
            ),
            scheduledAt: this.string(
              this.record(assessment.lesson).scheduledAt,
              "lesson scheduledAt",
            ),
            status: this.string(
              this.record(assessment.lesson).status,
              "lesson status",
            ),
            classroomId: this.string(
              this.record(assessment.lesson).classroomId,
              "lesson classroomId",
            ),
            classroomName: this.optionalString(
              this.record(assessment.lesson).classroomName,
            ),
            subjectId: this.optionalString(
              this.record(assessment.lesson).subjectId,
            ),
          }
        : null,
      createdAt: this.string(assessment.createdAt, "assessment created timestamp"),
      updatedAt: this.string(assessment.updatedAt, "assessment updated timestamp"),
    });
  }

  private record(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Expected an object payload.");
    }
    return value as Record<string, unknown>;
  }

  private string(value: unknown, fieldName: string): string {
    if (typeof value !== "string" || value.length === 0) {
      throw new Error(`Expected non-empty string for ${fieldName}.`);
    }
    return value;
  }

  private number(value: unknown, fieldName: string): number {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error(`Expected valid number for ${fieldName}.`);
    }
    return value;
  }

  private optionalNumber(value: unknown): number | null {
    return typeof value === "number" && !Number.isNaN(value) ? value : null;
  }

  private optionalString(value: unknown): string | null {
    return typeof value === "string" && value.length > 0 ? value : null;
  }

  private assessmentStatus(value: unknown): AssessmentStatus {
    if (
      value === "pending_marking" ||
      value === "partially_marked" ||
      value === "fully_marked"
    ) {
      return value;
    }
    throw new Error(`Unexpected assessment status value: ${String(value)}`);
  }
}

export const assessmentRepository = new AssessmentRepository();
