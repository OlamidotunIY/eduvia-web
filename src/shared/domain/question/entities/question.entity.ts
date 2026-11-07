import type { CreateQuestionDto, UpdateQuestionDto, QuestionOptionDto } from "@/shared/api/generated";

export type QuestionOwnerType = "platform" | "org" | "teacher";
export type QuestionType = "mcq" | "short_answer" | "long_answer";

export interface QuestionOption {
  key: string;
  text: string;
  imageUrl?: string | null;
}

export interface QuestionProvenance {
  source: string;
  createdBy: string;
  aiModel?: string | null;
  licenseRef?: string | null;
  paperRef?: string | null;
}

export interface QuestionRecordProps {
  id: string;
  ownerType: QuestionOwnerType;
  ownerId: string | null;
  orgId: string | null;
  type: QuestionType;
  stem: string;
  options: QuestionOption[];
  correctOptionKey: string | null;
  markScheme: string | null;
  maxMarks: number;
  difficultyLevel: number;
  subject: string;
  curriculumNodeId?: string | null;
  examBoard?: string | null;
  yearGroup?: string | null;
  tags: string[];
  provenance: QuestionProvenance;
  isPublished: boolean;
  usageCount: number;
  avgScore?: number | null;
  correctRate?: number | null;
  createdAt: string;
  updatedAt: string;
}

export class QuestionRecord {
  readonly id: string;
  readonly ownerType: QuestionOwnerType;
  readonly ownerId: string | null;
  readonly orgId: string | null;
  readonly type: QuestionType;
  readonly stem: string;
  readonly options: QuestionOption[];
  readonly correctOptionKey: string | null;
  readonly markScheme: string | null;
  readonly maxMarks: number;
  readonly difficultyLevel: number;
  readonly subject: string;
  readonly curriculumNodeId?: string | null;
  readonly examBoard?: string | null;
  readonly yearGroup?: string | null;
  readonly tags: string[];
  readonly provenance: QuestionProvenance;
  readonly isPublished: boolean;
  readonly usageCount: number;
  readonly avgScore?: number | null;
  readonly correctRate?: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(props: QuestionRecordProps) {
    this.id = props.id;
    this.ownerType = props.ownerType;
    this.ownerId = props.ownerId;
    this.orgId = props.orgId;
    this.type = props.type;
    this.stem = props.stem;
    this.options = props.options ?? [];
    this.correctOptionKey = props.correctOptionKey;
    this.markScheme = props.markScheme;
    this.maxMarks = props.maxMarks;
    this.difficultyLevel = props.difficultyLevel;
    this.subject = props.subject;
    this.curriculumNodeId = props.curriculumNodeId;
    this.examBoard = props.examBoard;
    this.yearGroup = props.yearGroup;
    this.tags = props.tags ?? [];
    this.provenance = props.provenance;
    this.isPublished = props.isPublished;
    this.usageCount = props.usageCount ?? 0;
    this.avgScore = props.avgScore;
    this.correctRate = props.correctRate;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isPlatform(): boolean {
    return this.ownerType === "platform";
  }

  isOrganization(): boolean {
    return this.ownerType === "org";
  }

  getTypeLabel(): string {
    switch (this.type) {
      case "mcq":
        return "Multiple choice";
      case "short_answer":
        return "Short answer";
      case "long_answer":
        return "Long answer";
      default:
        return this.type;
    }
  }

  getDifficultyLabel(): string {
    return `${this.difficultyLevel} / 5`;
  }

  getStatusLabel(): "Published" | "Draft" {
    return this.isPublished ? "Published" : "Draft";
  }
}

export interface QuestionSummary {
  totalAccessible: number;
  platformQuestions: number;
  orgQuestions: number;
  publishedOrgQuestions: number;
}

export interface QuestionFilter {
  ownerType?: QuestionOwnerType;
  subject?: string;
  type?: QuestionType;
  difficultyLevel?: number;
  isPublished?: boolean;
  search?: string;
  skip?: number;
  take?: number;
}

export type { CreateQuestionDto, UpdateQuestionDto, QuestionOptionDto };
