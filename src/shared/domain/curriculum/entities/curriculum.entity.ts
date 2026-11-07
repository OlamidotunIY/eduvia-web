import type { CreateCurriculumProfileDto, UpdateCurriculumProfileDto } from "@/shared/api/generated";

export type CurriculumNodeType =
  | "keystage"
  | "discipline"
  | "course"
  | "subject"
  | "strand"
  | "topic"
  | "learning_objective"
  | string;

export interface CurriculumProfileSummaryProps {
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

export class CurriculumProfileSummary {
  readonly id: string;
  readonly name: string;
  readonly shortCode: string;
  readonly countryCode: string;
  readonly jurisdictionCode: string;
  readonly authority: string;
  readonly description: string | null;
  readonly version: string | null;
  readonly sourceUrl: string | null;
  readonly isActive: boolean;
  readonly mappedOfferedSubjectCount: number;

  constructor(props: CurriculumProfileSummaryProps) {
    this.id = props.id;
    this.name = props.name;
    this.shortCode = props.shortCode;
    this.countryCode = props.countryCode;
    this.jurisdictionCode = props.jurisdictionCode;
    this.authority = props.authority;
    this.description = props.description;
    this.version = props.version;
    this.sourceUrl = props.sourceUrl;
    this.isActive = props.isActive;
    this.mappedOfferedSubjectCount = props.mappedOfferedSubjectCount;
  }
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

export interface CurriculumTreeNodeProps {
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
  children?: CurriculumTreeNode[];
}

export class CurriculumTreeNode {
  readonly id: string;
  readonly curriculumId: string;
  readonly parentNodeId: string | null;
  readonly nodeType: CurriculumNodeType;
  readonly name: string;
  readonly code: string | null;
  readonly description: string | null;
  readonly gradeLevel: string | null;
  readonly depth: number;
  readonly path: string;
  readonly isLeaf: boolean;
  readonly isActive: boolean;
  readonly children: CurriculumTreeNode[];

  constructor(props: CurriculumTreeNodeProps) {
    this.id = props.id;
    this.curriculumId = props.curriculumId;
    this.parentNodeId = props.parentNodeId;
    this.nodeType = props.nodeType;
    this.name = props.name;
    this.code = props.code;
    this.description = props.description;
    this.gradeLevel = props.gradeLevel;
    this.depth = props.depth;
    this.path = props.path;
    this.isLeaf = props.isLeaf;
    this.isActive = props.isActive;
    this.children = props.children ?? [];
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }
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

export interface CurriculumListFilter {
  countryCode?: string;
  isActive?: boolean;
}

export type { CreateCurriculumProfileDto, UpdateCurriculumProfileDto };
