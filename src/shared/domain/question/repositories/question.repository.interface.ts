import type {
  CreateQuestionInput,
  QuestionFilter,
  QuestionRecord,
  QuestionSummary,
  UpdateQuestionInput,
} from "../entities/question.entity";

export interface IQuestionRepository {
  search(organizationId: string, filter?: QuestionFilter): Promise<QuestionRecord[]>;
  getSummary(organizationId: string): Promise<QuestionSummary>;
  getById(organizationId: string, questionId: string): Promise<QuestionRecord>;
  create(organizationId: string, input: CreateQuestionInput): Promise<QuestionRecord>;
  update(organizationId: string, questionId: string, input: UpdateQuestionInput): Promise<QuestionRecord>;
  publish(organizationId: string, questionId: string): Promise<{ success: boolean }>;
  unpublish(organizationId: string, questionId: string): Promise<{ success: boolean }>;
  delete(organizationId: string, questionId: string): Promise<unknown>;
}
