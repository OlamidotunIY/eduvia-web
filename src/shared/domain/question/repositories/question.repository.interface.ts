import type {
  QuestionFilter,
  QuestionRecord,
  QuestionSummary,
} from "../entities/question.entity";
import type { CreateQuestionDto, UpdateQuestionDto } from "@/shared/api/generated";

export interface IQuestionRepository {
  search(organizationId: string, filter?: QuestionFilter): Promise<QuestionRecord[]>;
  getSummary(organizationId: string): Promise<QuestionSummary>;
  getById(organizationId: string, questionId: string): Promise<QuestionRecord>;
  create(organizationId: string, input: CreateQuestionDto): Promise<QuestionRecord>;
  update(organizationId: string, questionId: string, input: UpdateQuestionDto): Promise<QuestionRecord>;
  publish(organizationId: string, questionId: string): Promise<{ success: boolean }>;
  unpublish(organizationId: string, questionId: string): Promise<{ success: boolean }>;
  delete(organizationId: string, questionId: string): Promise<unknown>;
}
