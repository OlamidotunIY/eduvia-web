import type {
  CreateCurriculumInput,
  CurriculumListFilter,
  CurriculumProfileSummary,
  CurriculumSearchResult,
  CurriculumTreeResponse,
  OrganizationCurriculumOverview,
} from "../entities/curriculum.entity";

export interface ICurriculumRepository {
  getOverview(organizationId: string): Promise<OrganizationCurriculumOverview>;
  getTree(
    organizationId: string,
    curriculumId: string,
  ): Promise<CurriculumTreeResponse>;
  search(
    organizationId: string,
    query: string,
    curriculumId?: string,
  ): Promise<CurriculumSearchResult[]>;
}
