import type {
  AssessmentFilter,
  AssessmentList,
  AssessmentRecord,
  AssessmentStatus,
  AssessmentSummary,
  IAssessmentRepository,
} from "@/shared/domain";
import { assessmentApi } from "../rest/assessment.api";

export class AssessmentRepository implements IAssessmentRepository {
  async list(
    organizationId: string,
    filter?: AssessmentFilter,
  ): Promise<AssessmentList> {
    const value = record(await assessmentApi.list(organizationId, filter));
    if (!Array.isArray(value.items)) {
      throw new Error("The API returned an invalid assessment list.");
    }

    return {
      items: value.items.map(toAssessment),
      total: number(value.total, "assessment total"),
      skip: optionalNumber(value.skip) ?? 0,
      take: optionalNumber(value.take),
    };
  }

  async getSummary(
    organizationId: string,
    filter?: AssessmentFilter,
  ): Promise<AssessmentSummary> {
    const value = record(await assessmentApi.getSummary(organizationId, filter));
    return {
      total: number(value.total, "assessment summary total"),
      pendingMarking: number(value.pendingMarking, "pending marking count"),
      partiallyMarked: number(value.partiallyMarked, "partially marked count"),
      fullyMarked: number(value.fullyMarked, "fully marked count"),
      averageScorePercent: optionalNumber(value.averageScorePercent),
    };
  }
}

export const assessmentRepository = new AssessmentRepository();

function toAssessment(value: unknown): AssessmentRecord {
  const assessment = record(value);
  return {
    id: string(assessment.id, "assessment id"),
    organizationId: string(assessment.orgId, "assessment organization id"),
    lessonId: string(assessment.lessonId, "assessment lesson id"),
    boardId: string(assessment.boardId, "assessment board id"),
    studentId: string(assessment.studentId, "assessment learner id"),
    status: assessmentStatus(assessment.status),
    totalMaxMarks: number(assessment.totalMaxMarks, "assessment total marks"),
    totalMarksAwarded: optionalNumber(assessment.totalMarksAwarded),
    scorePercent: optionalNumber(assessment.scorePercent),
    autoMarkedCount: number(assessment.autoMarkedCount, "auto marked count"),
    teacherMarkedCount: number(
      assessment.teacherMarkedCount,
      "teacher marked count",
    ),
    pendingMarkCount: number(assessment.pendingMarkCount, "pending mark count"),
    learner: toLearner(assessment.learner),
    lesson: toLesson(assessment.lesson),
    createdAt: string(assessment.createdAt, "assessment created date"),
    updatedAt: string(assessment.updatedAt, "assessment updated date"),
  };
}

function toLearner(value: unknown): AssessmentRecord["learner"] {
  if (value === null || value === undefined) return null;
  const learner = record(value);
  return {
    id: string(learner.id, "learner id"),
    fullName: string(learner.fullName, "learner name"),
    email: string(learner.email, "learner email"),
    image: optionalString(learner.image),
  };
}

function toLesson(value: unknown): AssessmentRecord["lesson"] {
  if (value === null || value === undefined) return null;
  const lesson = record(value);
  return {
    id: string(lesson.id, "lesson id"),
    scheduledAt: string(lesson.scheduledAt, "lesson scheduled date"),
    status: string(lesson.status, "lesson status"),
    classroomId: string(lesson.classroomId, "lesson classroom id"),
    classroomName: optionalString(lesson.classroomName),
    subjectId: optionalString(lesson.subjectId),
  };
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The API returned an invalid assessment response.");
  }
  return value as Record<string, unknown>;
}

function string(value: unknown, name: string): string {
  if (typeof value !== "string") throw new Error(`The API is missing ${name}.`);
  return value;
}

function number(value: unknown, name: string): number {
  if (typeof value !== "number") throw new Error(`The API is missing ${name}.`);
  return value;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function assessmentStatus(value: unknown): AssessmentStatus {
  if (
    value === "pending_marking" ||
    value === "partially_marked" ||
    value === "fully_marked"
  ) {
    return value;
  }
  throw new Error("The API returned an invalid assessment status.");
}
