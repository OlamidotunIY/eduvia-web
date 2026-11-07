import {
  type IQuestionRepository,
  type QuestionFilter,
  QuestionRecord,
  type QuestionSummary,
} from "@/shared/domain";
import type { CreateQuestionDto, UpdateQuestionDto } from "@/shared/api/generated";
import { questionApi } from "../rest/question.api";

export class QuestionRepository implements IQuestionRepository {
  async search(
    organizationId: string,
    filter?: QuestionFilter,
  ): Promise<QuestionRecord[]> {
    const res = await questionApi.search(organizationId, filter);
    return (res.items ?? []).map((item) => this.toQuestionRecord(item));
  }

  async getSummary(organizationId: string): Promise<QuestionSummary> {
    return questionApi.getSummary(organizationId);
  }

  async getById(
    organizationId: string,
    questionId: string,
  ): Promise<QuestionRecord> {
    const raw = await questionApi.getById(organizationId, questionId);
    return this.toQuestionRecord(raw);
  }

  async create(
    organizationId: string,
    input: CreateQuestionDto,
  ): Promise<QuestionRecord> {
    const raw = await questionApi.create(organizationId, input);
    return this.toQuestionRecord(raw);
  }

  async update(
    organizationId: string,
    questionId: string,
    input: UpdateQuestionDto,
  ): Promise<QuestionRecord> {
    const raw = await questionApi.update(organizationId, questionId, input);
    return this.toQuestionRecord(raw);
  }

  async publish(
    organizationId: string,
    questionId: string,
  ): Promise<{ success: boolean }> {
    return questionApi.publish(organizationId, questionId);
  }

  async unpublish(
    organizationId: string,
    questionId: string,
  ): Promise<{ success: boolean }> {
    return questionApi.unpublish(organizationId, questionId);
  }

  async delete(
    organizationId: string,
    questionId: string,
  ): Promise<unknown> {
    return questionApi.delete(organizationId, questionId);
  }

  private toQuestionRecord(raw: any): QuestionRecord {
    if (raw instanceof QuestionRecord) return raw;
    return new QuestionRecord({
      id: String(raw.id),
      ownerType: raw.ownerType ?? "platform",
      ownerId: raw.ownerId ?? null,
      orgId: raw.orgId ?? null,
      type: raw.type ?? "mcq",
      stem: String(raw.stem ?? ""),
      options: Array.isArray(raw.options) ? raw.options : [],
      correctOptionKey: raw.correctOptionKey ?? null,
      markScheme: raw.markScheme ?? null,
      maxMarks: Number(raw.maxMarks ?? 1),
      difficultyLevel: Number(raw.difficultyLevel ?? 1),
      subject: String(raw.subject ?? ""),
      curriculumNodeId: raw.curriculumNodeId ?? null,
      examBoard: raw.examBoard ?? null,
      yearGroup: raw.yearGroup ?? null,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      provenance: raw.provenance ?? { source: "original", createdBy: "user" },
      isPublished: Boolean(raw.isPublished),
      usageCount: Number(raw.usageCount ?? 0),
      avgScore: raw.avgScore != null ? Number(raw.avgScore) : null,
      correctRate: raw.correctRate != null ? Number(raw.correctRate) : null,
      createdAt: String(raw.createdAt ?? new Date().toISOString()),
      updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    });
  }
}

export const questionRepository = new QuestionRepository();
