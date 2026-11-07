export type CurriculumNodeType =
  | "keystage"
  | "discipline"
  | "course"
  | "subject"
  | "strand"
  | "topic"
  | "learning_objective"
  | string;

export interface CurriculumProfileSummary {
  id: string;
  name: string;
  shortCode: string;
  countryCode: string;
  jurisdictionCode: string;
  authority: string;
  description: string | null;
  version: string | null;
  sourceUrl: string | null;
  isActive: boolean;
  mappedOfferedSubjectCount: number;
}

export interface OfferedSubjectSummary {
  id: string;
  name: string;
  platformSubjectId: string | null;
  isMapped: boolean;
}

export interface UnmappedSubjectSummary {
  id: string;
  name: string;
}

export interface OrganizationCurriculumOverview {
  organizationId: string;
  organizationCountry: string;
  coveredCountries: string[];
  coveredJurisdictions: string[];
  learnerGrades: string[];
  enrolledStudentCount: number;
  offeredSubjects: OfferedSubjectSummary[];
  unmappedSubjects: UnmappedSubjectSummary[];
  curricula: CurriculumProfileSummary[];
}

export interface CurriculumTreeNode {
  id: string;
  curriculumId: string;
  parentNodeId: string | null;
  nodeType: CurriculumNodeType;
  name: string;
  code: string | null;
  description: string | null;
  gradeLevel: string | null;
  depth: number;
  path: string;
  isLeaf: boolean;
  isActive: boolean;
  children: CurriculumTreeNode[];
}

export interface CurriculumTreeResponse {
  curriculum: {
    id: string;
    name: string;
    shortCode: string;
    countryCode: string;
    jurisdictionCode: string;
    authority: string;
    description: string | null;
    sourceUrl: string | null;
  };
  totalNodes: number;
  tree: CurriculumTreeNode[];
}

export interface CurriculumSearchResult {
  id: string;
  curriculumId: string;
  parentNodeId: string | null;
  nodeType: CurriculumNodeType;
  name: string;
  code: string | null;
  description: string | null;
  gradeLevel: string | null;
  depth: number;
  path: string;
  isLeaf: boolean;
  isActive: boolean;
}

export interface CreateCurriculumInput {
  name: string;
  shortCode: string;
  countryCode: string;
  jurisdictionCode: string;
  authority: string;
  description?: string;
  version?: string;
  sourceUrl?: string;
  isActive?: boolean;
}

export interface CurriculumListFilter {
  countryCode?: string;
  isActive?: boolean;
}
