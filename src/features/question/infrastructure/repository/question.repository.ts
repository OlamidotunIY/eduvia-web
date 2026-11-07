import type {
  CreateQuestionInput,
  IQuestionRepository,
  QuestionFilter,
  QuestionRecord,
  QuestionSummary,
  UpdateQuestionInput,
} from "@/shared/domain";
import { questionApi } from "../rest/question.api";

export class QuestionRepository implements IQuestionRepository {
  async search(
    organizationId: string,
    filter?: QuestionFilter,
  ): Promise<QuestionRecord[]> {
    const res = await questionApi.search(organizationId, filter);
    return res.items ?? [];
  }

  async getSummary(organizationId: string): Promise<QuestionSummary> {
    return questionApi.getSummary(organizationId);
  }

  async getById(
    organizationId: string,
    questionId: string,
  ): Promise<QuestionRecord> {
    return questionApi.getById(organizationId, questionId);
  }

  async create(
    organizationId: string,
    input: CreateQuestionInput,
  ): Promise<QuestionRecord> {
    return questionApi.create(organizationId, input);
  }

  async update(
    organizationId: string,
    questionId: string,
    input: UpdateQuestionInput,
  ): Promise<QuestionRecord> {
    return questionApi.update(organizationId, questionId, input);
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
}

export const questionRepository = new QuestionRepository();
