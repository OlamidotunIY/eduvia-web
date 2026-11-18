export type BoardMode = "teach" | "classwork" | "assignment" | "review" | "locked";

export type BoardSectionType = "text" | "image" | "questionBlock" | "divider";

export type BoardSurfaceStyle =
  | "blank"
  | "notebook"
  | "whiteboard"
  | "blackboard"
  | "grid";

export type NotebookWidthMode = "centered" | "full";

export type BoardDockToolId =
  | "select"
  | "pan"
  | "pen"
  | "pencil"
  | "fountain"
  | "highlighter"
  | "laser"
  | "eraser"
  | "line"
  | "arrow"
  | "rect"
  | "ellipse"
  | "text";

export type BoardStrokeToolKey =
  | "pen"
  | "pencil"
  | "fountain"
  | "highlighter"
  | "shape";

export interface BoardStrokeToolConfig {
  colorIndex: number;
  customColor: string | null;
  width: number; // 1..10
}

export type BoardEraserMode = "partial" | "stroke";

export type BoardDrawingTool = BoardDockToolId;

export interface LessonPlan {
  learningObjectives: string[];
  topicsCovered: string[];
  teachingNotes: string | null;
  homeworkDescription: string | null;
  isCompleted: boolean;
}

export interface BoardSection {
  id: string;
  boardId: string;
  type: BoardSectionType;
  content: string;
  position: number;
  createdBy: string;
  isTeacherOnly: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardQuestionOption {
  id: string;
  key: string;
  text: string;
  imageUrl: string | null;
}

export interface BoardQuestionDetail {
  id: string;
  type: string;
  stem: string;
  subject: string;
  difficultyLevel: number;
  maxMarks: number;
  options: BoardQuestionOption[];
}

export interface BoardQuestion {
  id: string;
  boardId: string;
  questionId: string;
  position: number;
  mode: "classwork" | "assignment" | string;
  assignedAt: string;
  dueAt: string | null;
  showOptions: boolean;
  maxMarks: number;
  question?: BoardQuestionDetail | null;
}

export interface StudentBoardResponse {
  id: string;
  boardQuestionId: string;
  studentId: string;
  studentName: string | null;
  studentEmail: string | null;
  studentImage: string | null;
  responseType: "text" | "image" | "mcq" | string;
  textContent: string | null;
  imageUrl: string | null;
  selectedOption: string | null;
  submittedAt: string;
  autoMarkResult: {
    isCorrect: boolean;
    marksAwarded: number;
    markedAt?: string;
  } | null;
  teacherMark: {
    marksAwarded: number;
    maxMarks: number;
    feedback?: string | null;
    markedBy?: string | null;
    markedAt?: string;
  } | null;
}

export interface BoardCanvasState {
  strokes: BoardCanvasStroke[];
  surfaceStyle?: BoardSurfaceStyle;
  boardBgColor?: string;
  notebookWidthMode?: NotebookWidthMode;
  notebookPages?: number;
}

export interface LessonBoard {
  id: string;
  lessonId: string;
  orgId: string;
  mode: BoardMode;
  isLocked: boolean;
  plan: LessonPlan;
  canvasState?: BoardCanvasState | null;
  sections: BoardSection[];
  questions: BoardQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardCanvasPoint {
  x: number;
  y: number;
}

export type BoardStrokeKind =
  | "freehand"
  | "line"
  | "arrow"
  | "rect"
  | "ellipse"
  | "text";

export type BoardPenStyle =
  | "ballpoint"
  | "pencil"
  | "fountain"
  | "marker"
  | "dashed";

export interface BoardCanvasStroke {
  id: string;
  points: BoardCanvasPoint[];
  colorIndex: number;
  color?: string;
  strokeWidth: number;
  isHighlighter: boolean;
  kind?: BoardStrokeKind;
  penStyle?: BoardPenStyle;
  text?: string;
  fill?: boolean;
}
