import type {
  AssessmentFilter,
  AssessmentList,
  AssessmentSummary,
} from "../entities/assessment.entity";

export interface IAssessmentRepository {
  list(
    organizationId: string,
    filter?: AssessmentFilter,
  ): Promise<AssessmentList>;
  getSummary(
    organizationId: string,
    filter?: AssessmentFilter,
  ): Promise<AssessmentSummary>;
}
