import type {
  BoardCanvasState,
  BoardCanvasStroke,
  BoardMode,
  BoardQuestion,
  BoardQuestionDetail,
  BoardSection,
  BoardSectionType,
  BoardSurfaceStyle,
  LessonBoard,
  NotebookWidthMode,
  StudentBoardResponse,
} from "@/shared/domain";
import { lessonBoardApi } from "../rest/lesson-board.api";

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${label} response.`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function normalizeBoardMode(value: unknown): BoardMode {
  const mode = asString(value, "teach").toLowerCase();
  if (
    mode === "classwork" ||
    mode === "assignment" ||
    mode === "review" ||
    mode === "locked"
  ) {
    return mode;
  }
  return "teach";
}

function normalizeSectionType(value: unknown): BoardSectionType {
  const type = asString(value, "text");
  if (
    type === "image" ||
    type === "questionBlock" ||
    type === "divider" ||
    type === "text"
  ) {
    return type;
  }
  return "text";
}

export class LessonBoardRepository {
  async getByLesson(lessonId: string): Promise<LessonBoard> {
    return this.toBoard(await lessonBoardApi.getByLesson(lessonId));
  }

  async getById(organizationId: string, boardId: string): Promise<LessonBoard> {
    return this.toBoard(await lessonBoardApi.getById(organizationId, boardId));
  }

  async uploadFile(boardId: string, file: File): Promise<string> {
    const contentType = file.type || "application/octet-stream";
    const { uploadUrl, fileUrl } = await lessonBoardApi.getUploadUrl(boardId, {
      filename: file.name,
      contentType,
    });

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload file to storage.");
    }

    return fileUrl;
  }

  async listResponses(
    boardId: string,
    boardQuestionId: string,
  ): Promise<StudentBoardResponse[]> {
    const raw = await lessonBoardApi.listResponses(boardId, boardQuestionId);
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => this.toResponse(item));
  }

  async getMyResponse(
    boardId: string,
    boardQuestionId: string,
  ): Promise<StudentBoardResponse | null> {
    try {
      const raw = await lessonBoardApi.getMyResponse(boardId, boardQuestionId);
      if (!raw) return null;
      return this.toResponse(raw);
    } catch {
      return null;
    }
  }

  private toBoard(value: unknown): LessonBoard {
    const row = asRecord(value, "learning board");
    const planRow =
      row.plan && typeof row.plan === "object" && !Array.isArray(row.plan)
        ? (row.plan as Record<string, unknown>)
        : {};
    const sectionsRaw = Array.isArray(row.sections) ? row.sections : [];
    const questionsRaw = Array.isArray(row.questions) ? row.questions : [];

    return {
      id: asString(row.id),
      lessonId: asString(row.lessonId),
      orgId: asString(row.orgId),
      mode: normalizeBoardMode(row.mode),
      isLocked: Boolean(row.isLocked),
      plan: {
        learningObjectives: asStringArray(planRow.learningObjectives),
        topicsCovered: asStringArray(planRow.topicsCovered),
        teachingNotes: asOptionalString(planRow.teachingNotes),
        homeworkDescription: asOptionalString(planRow.homeworkDescription),
        isCompleted: Boolean(planRow.isCompleted ?? planRow.isComplete),
      },
      canvasState: this.toCanvasState(row.canvasState),
      sections: sectionsRaw
        .map((item) => this.toSection(item))
        .sort((a, b) => a.position - b.position),
      questions: questionsRaw
        .map((item) => this.toQuestion(item))
        .sort((a, b) => a.position - b.position),
      createdAt: asOptionalString(row.createdAt) ?? undefined,
      updatedAt: asOptionalString(row.updatedAt) ?? undefined,
    };
  }

  private toCanvasState(value: unknown): BoardCanvasState | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }
    const raw = value as Record<string, unknown>;
    const strokesRaw = Array.isArray(raw.strokes) ? raw.strokes : [];
    const strokes: BoardCanvasStroke[] = strokesRaw
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item && typeof item === "object" && !Array.isArray(item)),
      )
      .map((item) => ({
        id: asString(item.id, `${Date.now()}`),
        points: Array.isArray(item.points)
          ? item.points
              .filter(
                (pt): pt is Record<string, unknown> =>
                  Boolean(pt && typeof pt === "object"),
              )
              .map((pt) => ({
                x: asNumber(pt.x, 0),
                y: asNumber(pt.y, 0),
              }))
          : [],
        colorIndex: asNumber(item.colorIndex, 0),
        color: asOptionalString(item.color) ?? undefined,
        strokeWidth: asNumber(item.strokeWidth, 3),
        isHighlighter: Boolean(item.isHighlighter),
        kind:
          typeof item.kind === "string"
            ? (item.kind as BoardCanvasStroke["kind"])
            : undefined,
        penStyle:
          typeof item.penStyle === "string"
            ? (item.penStyle as BoardCanvasStroke["penStyle"])
            : undefined,
        text: asOptionalString(item.text) ?? undefined,
        fill: typeof item.fill === "boolean" ? item.fill : undefined,
      }));

    const surfaceStyle: BoardSurfaceStyle | undefined =
      typeof raw.surfaceStyle === "string"
        ? (raw.surfaceStyle as BoardSurfaceStyle)
        : undefined;
    const notebookWidthMode: NotebookWidthMode | undefined =
      raw.notebookWidthMode === "full" || raw.notebookWidthMode === "centered"
        ? raw.notebookWidthMode
        : undefined;

    return {
      strokes,
      surfaceStyle,
      boardBgColor: asOptionalString(raw.boardBgColor) ?? undefined,
      notebookWidthMode,
      notebookPages:
        typeof raw.notebookPages === "number" && raw.notebookPages >= 1
          ? raw.notebookPages
          : undefined,
    };
  }

  private toSection(value: unknown): BoardSection {
    const s = asRecord(value, "board section");
    return {
      id: asString(s.id),
      boardId: asString(s.boardId),
      type: normalizeSectionType(s.type),
      content: asString(s.content),
      position: asNumber(s.position, 0),
      createdBy: asString(s.createdBy),
      isTeacherOnly: Boolean(s.isTeacherOnly),
      createdAt: asOptionalString(s.createdAt) ?? undefined,
      updatedAt: asOptionalString(s.updatedAt) ?? undefined,
    };
  }

  private toQuestion(value: unknown): BoardQuestion {
    const q = asRecord(value, "board question");
    let detail: BoardQuestionDetail | null = null;

    if (q.question && typeof q.question === "object" && !Array.isArray(q.question)) {
      const qr = q.question as Record<string, unknown>;
      const opts = Array.isArray(qr.options) ? qr.options : [];
      detail = {
        id: asString(qr.id),
        type: asString(qr.type, "short_answer"),
        stem: asString(qr.stem),
        subject: asString(qr.subject),
        difficultyLevel: asNumber(qr.difficultyLevel, 1),
        maxMarks: asNumber(qr.maxMarks, asNumber(q.maxMarks, 10)),
        options: opts
          .filter(
            (opt): opt is Record<string, unknown> =>
              Boolean(opt && typeof opt === "object"),
          )
          .map((opt) => ({
            id: asString(opt.id),
            key: asString(opt.key),
            text: asString(opt.text),
            imageUrl: asOptionalString(opt.imageUrl),
          })),
      };
    }

    return {
      id: asString(q.id),
      boardId: asString(q.boardId),
      questionId: asString(q.questionId),
      position: asNumber(q.position, 0),
      mode: asString(q.mode, "classwork"),
      assignedAt: asString(q.assignedAt),
      dueAt: asOptionalString(q.dueAt),
      showOptions: q.showOptions !== false,
      maxMarks: asNumber(q.maxMarks, 10),
      question: detail,
    };
  }

  private toResponse(value: unknown): StudentBoardResponse {
    const r = asRecord(value, "student response");
    const autoRaw =
      r.autoMarkResult &&
      typeof r.autoMarkResult === "object" &&
      !Array.isArray(r.autoMarkResult)
        ? (r.autoMarkResult as Record<string, unknown>)
        : null;
    const teacherRaw =
      r.teacherMark &&
      typeof r.teacherMark === "object" &&
      !Array.isArray(r.teacherMark)
        ? (r.teacherMark as Record<string, unknown>)
        : null;

    return {
      id: asString(r.id),
      boardQuestionId: asString(r.boardQuestionId),
      studentId: asString(r.studentId),
      studentName: asOptionalString(r.studentName),
      studentEmail: asOptionalString(r.studentEmail),
      studentImage: asOptionalString(r.studentImage),
      responseType: asString(r.responseType, "text"),
      textContent: asOptionalString(r.textContent),
      imageUrl: asOptionalString(r.imageUrl),
      selectedOption: asOptionalString(r.selectedOption),
      submittedAt: asString(r.submittedAt),
      autoMarkResult: autoRaw
        ? {
            isCorrect: Boolean(autoRaw.isCorrect),
            marksAwarded: asNumber(autoRaw.marksAwarded, 0),
            markedAt: asOptionalString(autoRaw.markedAt) ?? undefined,
          }
        : null,
      teacherMark: teacherRaw
        ? {
            marksAwarded: asNumber(teacherRaw.marksAwarded, 0),
            maxMarks: asNumber(teacherRaw.maxMarks, 10),
            feedback: asOptionalString(teacherRaw.feedback),
            markedBy: asOptionalString(teacherRaw.markedBy) ?? undefined,
            markedAt: asOptionalString(teacherRaw.markedAt) ?? undefined,
          }
        : null,
    };
  }
}

export const lessonBoardRepository = new LessonBoardRepository();
