export type QuestionOwnerType = "platform" | "org" | "teacher";
export type QuestionType = "mcq" | "short_answer" | "long_answer";

export interface QuestionOption {
  key: string;
  text: string;
  imageUrl?: string | null;
}

export interface QuestionRecord {
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
  provenance: {
    source: string;
    createdBy: string;
    aiModel?: string | null;
    licenseRef?: string | null;
    paperRef?: string | null;
  };
  isPublished: boolean;
  usageCount: number;
  avgScore?: number | null;
  correctRate?: number | null;
  createdAt: string;
  updatedAt: string;
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

export interface CreateQuestionInput {
  type: QuestionType;
  stem: string;
  options?: Array<{ key: string; text: string; imageUrl?: string | null }>;
  correctOptionKey?: string | null;
  markScheme?: string | null;
  maxMarks: number;
  difficultyLevel: number;
  subject: string;
  curriculumNodeId?: string | null;
  examBoard?: string | null;
  yearGroup?: string | null;
  tags?: string[];
  isPublished?: boolean;
}

export interface UpdateQuestionInput {
  stem?: string;
  options?: Array<{ key: string; text: string; imageUrl?: string | null }>;
  correctOptionKey?: string | null;
  markScheme?: string | null;
  maxMarks?: number;
}
