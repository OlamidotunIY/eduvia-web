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
  listAll(filter?: CurriculumListFilter): Promise<CurriculumProfileSummary[]>;
  create(data: CreateCurriculumInput): Promise<CurriculumProfileSummary>;
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
  createNode(curriculumId: string, data: any): Promise<any>;
  updateNode(nodeId: string, data: any): Promise<any>;
  deactivateNode(nodeId: string): Promise<any>;
  getTree(
    organizationId: string,
    curriculumId: string,
    preview?: boolean,
  ): Promise<CurriculumTreeResponse>;
  search(
    organizationId: string,
    query: string,
    curriculumId?: string,
  ): Promise<CurriculumSearchResult[]>;
}
