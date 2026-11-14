import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Copy,
  EyeOff,
  FileUp,
  HelpCircle,
  Layers,
  Lock,
  Maximize2,
  Minimize2,
  PenTool,
  Play,
  Plus,
  StickyNote,
  Unlock,
  Video,
  X,
} from "lucide-react";
import { API_BASE_URL } from "@/shared/constant/api-constant";
import { lessonRoute } from "@/shared/constant/routes.constants";
import type {
  BoardCanvasState,
  BoardCanvasStroke,
  BoardMode,
  BoardQuestion,
  BoardSection,
  BoardSurfaceStyle,
  NotebookWidthMode,
} from "@/shared/domain";
import { authStore, sessionStore } from "@/shared/store";
import { boardUiStore } from "@/shared/store/board-ui-state";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Skeleton } from "@/shared/ui/skeleton";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";
import {
  useAddBoardSectionMutation,
  useAttachBoardQuestionMutation,
  useBoardByLessonQuery,
  useBoardSocket,
  useClassroomDetailQuery,
  useClassroomLessonsQuery,
  useCompleteBoardPlanMutation,
  useCompleteLessonMutation,
  useImportBoardContentMutation,
  useLessonQuery,
  useRemoveBoardQuestionMutation,
  useRemoveBoardSectionMutation,
  useSaveBoardPlanMutation,
  useStartLessonMutation,
  useSwitchBoardModeMutation,
  useToggleBoardLockMutation,
  useUpdateBoardSectionMutation,
  useUploadBoardMaterialMutation,
} from "../../application";
import { lessonBoardApi, lessonBoardRepository } from "../../infrastructure";
import { BoardCanvasObjectsLayer } from "../components/board-canvas-objects";
import { BoardCanvasPanel } from "../components/board-canvas-panel";
import {
  AttachQuestionBankDialog,
  StudentAnswerDialog,
  TeacherResponsesSheet,
} from "../components/board-classwork-panel";
import { BoardPlanDrawerContent } from "../components/board-plan-panel";
import { LessonStatusBadge } from "../components/lesson-status-badge";
import {
  formatLessonScheduleDate,
  formatLessonScheduleTimeRange,
} from "../utils/lesson-schedule.utils";

const ALLOWED_MODE_TRANSITIONS: Record<BoardMode, BoardMode[]> = {
  teach: ["classwork", "locked", "review"],
  classwork: ["teach", "assignment", "locked", "review"],
  assignment: ["review", "teach"],
  locked: ["teach", "review"],
  review: ["teach", "classwork", "assignment"],
};

const ALL_MODES: Array<{ value: BoardMode; label: string }> = [
  { value: "teach", label: "Teach" },
  { value: "classwork", label: "Classwork" },
  { value: "assignment", label: "Assignment" },
  { value: "review", label: "Review" },
  { value: "locked", label: "Locked" },
];

const MODE_LABELS: Record<BoardMode, string> = {
  teach: "Teach",
  classwork: "Classwork",
  assignment: "Assignment",
  review: "Review",
  locked: "Locked",
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

const APP_DARK_BOARD_BG = "#0b0c0e";
const APP_LIGHT_BOARD_BG = "#ffffff";
const DEFAULT_NOTEBOOK_PAGES = 2;

type LoadedBoard = NonNullable<ReturnType<typeof useBoardByLessonQuery>["data"]>;
type LoadedLesson = ReturnType<typeof useLessonQuery>["data"];
type LoadedClassroom = ReturnType<typeof useClassroomDetailQuery>["data"];

function getBoardCanvasStorageKey(boardId: string): string {
  return `eduvia:board:${boardId}:canvas`;
}

function readStoredBoardCanvas(
  boardId: string,
): { updatedAt: number; state: BoardCanvasState } | null {
  try {
    const raw = window.localStorage.getItem(getBoardCanvasStorageKey(boardId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      updatedAt?: unknown;
      state?: unknown;
    };
    if (!parsed || typeof parsed.state !== "object" || parsed.state === null) {
      return null;
    }
    const stateObj = parsed.state as Partial<BoardCanvasState>;
    if (!Array.isArray(stateObj.strokes)) return null;
    return {
      updatedAt:
        typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
      state: {
        strokes: stateObj.strokes,
        surfaceStyle: stateObj.surfaceStyle,
        boardBgColor: stateObj.boardBgColor,
        notebookWidthMode: stateObj.notebookWidthMode,
        notebookPages: stateObj.notebookPages,
      },
    };
  } catch {
    return null;
  }
}

function writeStoredBoardCanvas(boardId: string, state: BoardCanvasState): void {
  try {
    window.localStorage.setItem(
      getBoardCanvasStorageKey(boardId),
      JSON.stringify({ updatedAt: Date.now(), state }),
    );
  } catch {
    // Ignore storage quota errors
  }
}

function resolveInitialCanvasState(board: LoadedBoard): {
  strokes: BoardCanvasStroke[];
  surfaceStyle: BoardSurfaceStyle;
  boardBgColor: string;
  notebookWidthMode: NotebookWidthMode;
  notebookPages: number;
  hasSavedBg: boolean;
} {
  const defaultBg = document.documentElement.classList.contains("dark")
    ? APP_DARK_BOARD_BG
    : APP_LIGHT_BOARD_BG;

  const remote = board.canvasState ?? null;
  const local = readStoredBoardCanvas(board.id);
  const remoteUpdatedAt = board.updatedAt
    ? new Date(board.updatedAt).getTime()
    : 0;

  let chosen: BoardCanvasState | null;
  if (local && remote) {
    if (
      local.updatedAt > remoteUpdatedAt ||
      (remote.strokes.length === 0 && local.state.strokes.length > 0)
    ) {
      chosen = local.state;
    } else {
      chosen = remote;
    }
  } else {
    chosen = remote ?? local?.state ?? null;
  }

  return {
    strokes: chosen?.strokes ?? [],
    surfaceStyle: chosen?.surfaceStyle ?? "blank",
    boardBgColor: chosen?.boardBgColor ?? defaultBg,
    notebookWidthMode: chosen?.notebookWidthMode ?? "centered",
    notebookPages: Math.max(
      1,
      chosen?.notebookPages ?? DEFAULT_NOTEBOOK_PAGES,
    ),
    hasSavedBg: Boolean(chosen?.boardBgColor),
  };
}

export function LessonBoardPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const currentUserId = currentUser?.user.id;
  const userType = currentUser?.user.userType;

  const lessonQuery = useLessonQuery(organizationId, lessonId);
  const lesson = lessonQuery.data;

  const boardQuery = useBoardByLessonQuery(lessonId);
  const board = boardQuery.data;

  const classroomQuery = useClassroomDetailQuery(
    organizationId,
    lesson?.classroomId,
  );
  const classroom = classroomQuery.data;

  if (lessonQuery.isPending || boardQuery.isPending) {
    return (
      <div className="relative flex flex-1 items-center justify-center bg-muted/20 p-6">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
    );
  }

  if (!board || !lessonId) {
    return (
      <section className="mx-auto flex max-w-xl flex-1 flex-col items-start justify-center p-6">
        <p className="text-sm font-medium text-primary">Learning Board</p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">
          Learning board unavailable
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {boardQuery.error instanceof Error
            ? boardQuery.error.message
            : "This learning board could not be loaded for the requested lesson."}
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() =>
            navigate(lessonId ? lessonRoute(lessonId) : "/calendar")
          }
        >
          <ArrowLeft className="size-4" /> Back to lesson
        </Button>
      </section>
    );
  }

  return (
    <LessonBoardWorkspace
      key={board.id}
      lessonId={lessonId}
      lesson={lesson}
      board={board}
      classroom={classroom}
      organizationId={organizationId}
      orgRole={currentUser?.activeOrganization?.role?.toLowerCase() ?? ""}
      permissions={permissions}
      currentUserId={currentUserId}
      userType={userType}
    />
  );
}

function LessonBoardWorkspace({
  lessonId,
  lesson,
  board,
  classroom,
  organizationId,
  orgRole,
  permissions,
  currentUserId,
  userType,
}: {
  lessonId: string;
  lesson: LoadedLesson;
  board: LoadedBoard;
  classroom: LoadedClassroom;
  organizationId?: string;
  orgRole: string;
  permissions: string[];
  currentUserId?: string;
  userType?: string;
}) {
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTeacherOnlyRef = useRef(false);

  const [initialCanvas] = useState(() => resolveInitialCanvasState(board));
  const [strokes, setStrokes] = useState<BoardCanvasStroke[]>(
    () => initialCanvas.strokes,
  );
  const [undoHistory, setUndoHistory] = useState<BoardCanvasStroke[][]>([]);
  const [redoHistory, setRedoHistory] = useState<BoardCanvasStroke[][]>([]);
  const [surfaceStyle, setSurfaceStyle] = useState<BoardSurfaceStyle>(
    () => initialCanvas.surfaceStyle,
  );
  const [boardBgColor, setBoardBgColor] = useState<string>(
    () => initialCanvas.boardBgColor,
  );
  const [notebookWidthMode, setNotebookWidthMode] = useState<NotebookWidthMode>(
    () => initialCanvas.notebookWidthMode,
  );
  const [notebookPages, setNotebookPages] = useState<number>(
    () => initialCanvas.notebookPages,
  );
  const [saveRevision, setSaveRevision] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const hasManualBgRef = useRef(initialCanvas.hasSavedBg);
  const isDirtyRef = useRef(false);
  const latestCanvasRef = useRef<BoardCanvasState>({
    strokes: initialCanvas.strokes,
    surfaceStyle: initialCanvas.surfaceStyle,
    boardBgColor: initialCanvas.boardBgColor,
    notebookWidthMode: initialCanvas.notebookWidthMode,
    notebookPages: initialCanvas.notebookPages,
  });
  const moveSyncTimerRef = useRef<number | null>(null);

  const [planDrawerOpen, setPlanDrawerOpen] = useState(false);
  const [questionBankOpen, setQuestionBankOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [allCardsCollapsed, setAllCardsCollapsed] = useState(false);
  const isFullscreen = boardUiStore((state) => state.isBoardFullscreen);
  const setIsFullscreen = boardUiStore((state) => state.setBoardFullscreen);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, [setIsFullscreen]);

  const toggleFullscreen = useCallback(async () => {
    const currentlyFullscreen =
      boardUiStore.getState().isBoardFullscreen ||
      Boolean(document.fullscreenElement);
    if (currentlyFullscreen) {
      exitFullscreen();
      return;
    }

    setIsFullscreen(true);
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Keep immersive app fullscreen active even if browser blocks OS fullscreen
    }
  }, [exitFullscreen, setIsFullscreen]);

  // Reset fullscreen chrome cleanly only when leaving the board page
  useEffect(() => {
    return () => {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined);
      }
    };
  }, [setIsFullscreen]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const hasOpenDialog = Boolean(
          document.querySelector('[role="dialog"], [role="alertdialog"]'),
        );
        const currentlyFullscreen =
          boardUiStore.getState().isBoardFullscreen ||
          Boolean(document.fullscreenElement);
        if (!hasOpenDialog && currentlyFullscreen) {
          event.preventDefault();
          exitFullscreen();
        }
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key.toLowerCase() === "f"
      ) {
        event.preventDefault();
        void toggleFullscreen();
      }
    };

    const observer = new MutationObserver(() => {
      if (hasManualBgRef.current) return;
      const isDark = document.documentElement.classList.contains("dark");
      setBoardBgColor(isDark ? APP_DARK_BOARD_BG : APP_LIGHT_BOARD_BG);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      observer.disconnect();
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [exitFullscreen, setIsFullscreen, toggleFullscreen]);
  const [answeringQuestion, setAnsweringQuestion] =
    useState<BoardQuestion | null>(null);
  const [reviewQuestion, setReviewQuestion] = useState<BoardQuestion | null>(
    null,
  );
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<BoardSection | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteTeacherOnly, setNoteTeacherOnly] = useState(false);

  const [boardNotice, setBoardNotice] = useState<{
    tone: "error" | "info";
    message: string;
  } | null>(null);

  const {
    isConnected,
    emitStroke,
    emitCanvasReplace,
    emitClear,
    emitSurfaceStyle,
  } = useBoardSocket({
    organizationId,
    lessonId,
    boardId: board.id,
    onRemoteStroke: (remoteStroke) => {
      setStrokes((prev) => {
        const next = [...prev, remoteStroke];
        writeStoredBoardCanvas(board.id, {
          ...latestCanvasRef.current,
          strokes: next,
        });
        return next;
      });
    },
    onRemoteCanvasReplace: (nextStrokes) => {
      setStrokes(nextStrokes);
      writeStoredBoardCanvas(board.id, {
        ...latestCanvasRef.current,
        strokes: nextStrokes,
      });
    },
    onRemoteClear: () => {
      setUndoHistory((h) => [...h, strokes]);
      setStrokes([]);
      setRedoHistory([]);
      writeStoredBoardCanvas(board.id, {
        ...latestCanvasRef.current,
        strokes: [],
      });
      setBoardNotice({ tone: "info", message: "Board canvas cleared." });
    },
    onRemoteSurfaceChange: (style) => {
      if (style === "notebook") {
        setSurfaceStyle("notebook");
        writeStoredBoardCanvas(board.id, {
          ...latestCanvasRef.current,
          surfaceStyle: "notebook",
        });
      } else {
        setSurfaceStyle("blank");
        const nextBg =
          style === "blackboard"
            ? APP_DARK_BOARD_BG
            : style === "whiteboard"
              ? APP_LIGHT_BOARD_BG
              : latestCanvasRef.current.boardBgColor;
        if (nextBg) {
          setBoardBgColor(nextBg);
        }
        writeStoredBoardCanvas(board.id, {
          ...latestCanvasRef.current,
          surfaceStyle: "blank",
          boardBgColor: nextBg,
        });
      }
    },
  });

  const startLesson = useStartLessonMutation(
    organizationId,
    lessonId,
    lesson?.classroomId,
  );
  const completeLesson = useCompleteLessonMutation(
    organizationId,
    lessonId,
    lesson?.classroomId,
  );
  const savePlan = useSaveBoardPlanMutation(organizationId, board?.id, lessonId);
  const completePlan = useCompleteBoardPlanMutation(
    organizationId,
    board?.id,
    lessonId,
  );
  const switchMode = useSwitchBoardModeMutation(
    organizationId,
    board?.id,
    lessonId,
  );
  const toggleLock = useToggleBoardLockMutation(
    organizationId,
    board?.id,
    lessonId,
  );
  const importContent = useImportBoardContentMutation(
    organizationId,
    board?.id,
    lessonId,
  );
  const addSection = useAddBoardSectionMutation(
    organizationId,
    board?.id,
    lessonId,
  );
  const updateSection = useUpdateBoardSectionMutation(
    organizationId,
    board?.id,
    lessonId,
  );
  const removeSection = useRemoveBoardSectionMutation(
    organizationId,
    board?.id,
    lessonId,
  );
  const uploadMaterial = useUploadBoardMaterialMutation(
    organizationId,
    board?.id,
    lessonId,
  );
  const attachQuestion = useAttachBoardQuestionMutation(
    organizationId,
    board?.id,
    lessonId,
  );
  const removeQuestion = useRemoveBoardQuestionMutation(
    organizationId,
    board?.id,
    lessonId,
  );

  const isStudent = userType === "student" || orgRole === "student";
  const isAssignedTeacher =
    Boolean(currentUserId) &&
    Boolean(lesson) &&
    (lesson?.teacherId === currentUserId ||
      lesson?.coverTeacherId === currentUserId);
  const canControlBoard =
    !isStudent &&
    (permissions.includes("lessons:manage") ||
      isAssignedTeacher ||
      orgRole === "teacher");

  const statusUpper = lesson?.status.toUpperCase() ?? "";
  const isCancelledOrNoShow =
    statusUpper === "CANCELLED" ||
    statusUpper === "STUDENT_NO_SHOW" ||
    statusUpper === "TEACHER_NO_SHOW";

  const allowedNextModes = ALLOWED_MODE_TRANSITIONS[board.mode] ?? [];
  const isBoardLocked = board.isLocked || board.mode === "locked";
  const canDrawOnCanvas =
    !isCancelledOrNoShow &&
    !isBoardLocked &&
    (canControlBoard || board.mode === "classwork");
  const canPersistRemote = canControlBoard || canDrawOnCanvas;
  const canPersistRemoteRef = useRef(canPersistRemote);

  const currentCanvasState = useMemo<BoardCanvasState>(
    () => ({
      strokes,
      surfaceStyle,
      boardBgColor,
      notebookWidthMode,
      notebookPages,
    }),
    [strokes, surfaceStyle, boardBgColor, notebookWidthMode, notebookPages],
  );

  const bumpCanvasDirty = useCallback(() => {
    setSaveRevision((v) => v + 1);
    if (canPersistRemote) {
      setSaveStatus("saving");
    }
  }, [canPersistRemote]);

  useEffect(() => {
    canPersistRemoteRef.current = canPersistRemote;
    latestCanvasRef.current = currentCanvasState;
  }, [canPersistRemote, currentCanvasState]);

  useEffect(() => {
    if (saveRevision === 0) return;
    writeStoredBoardCanvas(board.id, currentCanvasState);
    if (!canPersistRemote) return;

    isDirtyRef.current = true;
    const timer = window.setTimeout(() => {
      isDirtyRef.current = false;
      void lessonBoardApi
        .saveCanvasState(board.id, currentCanvasState)
        .then(() => {
          setSaveStatus("saved");
        })
        .catch(() => {
          setSaveStatus("idle");
        });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [board.id, canPersistRemote, currentCanvasState, saveRevision]);

  useEffect(() => {
    const flushKeepalive = () => {
      if (moveSyncTimerRef.current !== null) {
        window.clearTimeout(moveSyncTimerRef.current);
        moveSyncTimerRef.current = null;
      }
      if (!isDirtyRef.current || !canPersistRemoteRef.current) return;
      isDirtyRef.current = false;
      const payload = latestCanvasRef.current;
      writeStoredBoardCanvas(board.id, payload);
      const token = authStore.getState().accessToken;
      void fetch(`${API_BASE_URL}/boards/${board.id}/canvas`, {
        method: "PATCH",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }).catch(() => undefined);
    };

    window.addEventListener("pagehide", flushKeepalive);
    return () => {
      window.removeEventListener("pagehide", flushKeepalive);
      flushKeepalive();
    };
  }, [board.id]);

  const drawReadOnlyReason = isCancelledOrNoShow
    ? "Session is closed."
    : isBoardLocked
      ? "Board is locked."
      : isStudent
        ? "Drawing opens for learners during Classwork mode."
        : undefined;

  const visibleSectionsCount = (board.sections ?? []).filter(
    (s) => s.type !== "divider" && (canControlBoard || !s.isTeacherOnly),
  ).length;
  const totalPinnedCount = (board.questions?.length ?? 0) + visibleSectionsCount;

  const triggerFilePicker = (teacherOnly: boolean) => {
    uploadTeacherOnlyRef.current = teacherOnly;
    fileInputRef.current?.click();
  };

  const openNewNote = () => {
    setEditingNote(null);
    setNoteDraft("");
    setNoteTeacherOnly(false);
    setNoteDialogOpen(true);
  };

  const openEditNote = (section: BoardSection) => {
    setEditingNote(section);
    setNoteDraft(section.content);
    setNoteTeacherOnly(section.isTeacherOnly);
    setNoteDialogOpen(true);
  };

  const handleSaveNote = async () => {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    setBoardNotice(null);
    try {
      if (editingNote) {
        await updateSection.mutateAsync({
          sectionId: editingNote.id,
          content: trimmed,
        });
      } else {
        await addSection.mutateAsync({
          type: "text",
          content: trimmed,
          isTeacherOnly: noteTeacherOnly,
        });
      }
      setNoteDialogOpen(false);
    } catch (error) {
      setBoardNotice({
        tone: "error",
        message: getErrorMessage(error, "Could not save note."),
      });
    }
  };

  const handleModeSwitch = async (nextMode: BoardMode) => {
    setBoardNotice(null);
    try {
      await switchMode.mutateAsync({
        mode: nextMode,
        lessonStatus: lesson?.status,
      });
      setBoardNotice({
        tone: "info",
        message: `Switched board to ${MODE_LABELS[nextMode]} mode.`,
      });
    } catch (error) {
      setBoardNotice({
        tone: "error",
        message: getErrorMessage(error, "Could not switch board mode."),
      });
    }
  };

  const handleToggleLock = async () => {
    setBoardNotice(null);
    try {
      await toggleLock.mutateAsync(!isBoardLocked);
    } catch (error) {
      setBoardNotice({
        tone: "error",
        message: getErrorMessage(error, "Could not update lock state."),
      });
    }
  };

  const handleUploadFile = async (file: File) => {
    setBoardNotice(null);
    try {
      await uploadMaterial.mutateAsync({
        file,
        isTeacherOnly: uploadTeacherOnlyRef.current,
      });
      setBoardNotice({
        tone: "info",
        message: `Pinned "${file.name}" onto the board.`,
      });
    } catch (error) {
      setBoardNotice({
        tone: "error",
        message: getErrorMessage(error, "Could not upload file to board."),
      });
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden bg-background",
        isFullscreen
          ? "fixed inset-0 z-50 flex h-screen w-screen"
          : "relative flex min-h-0 flex-1",
      )}
    >
      {/* Hidden multi-format file upload input triggered from board HUD */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleUploadFile(file);
          }
          event.target.value = "";
        }}
      />

      {/* Base Layer: Full-Bleed Interactive Whiteboard Engine */}
      <BoardCanvasPanel
        strokes={strokes}
        surfaceStyle={surfaceStyle}
        boardBgColor={boardBgColor}
        notebookWidthMode={notebookWidthMode}
        notebookPages={notebookPages}
        isReadOnly={!canDrawOnCanvas}
        readOnlyReason={drawReadOnlyReason}
        canUndo={undoHistory.length > 0}
        canRedo={redoHistory.length > 0}
        isSavingSnapshot={uploadMaterial.isPending}
        canSaveSnapshot={canControlBoard && !isCancelledOrNoShow}
        onAddStroke={(stroke) => {
          setUndoHistory((h) => [...h, strokes]);
          setStrokes((prev) => [...prev, stroke]);
          setRedoHistory([]);
          emitStroke(stroke);
          bumpCanvasDirty();
        }}
        onMoveStroke={(strokeId, dxNorm, dyNorm) => {
          setStrokes((prev) => {
            const next = prev.map((stroke) =>
              stroke.id === strokeId
                ? {
                    ...stroke,
                    points: stroke.points.map((pt) => ({
                      x: pt.x + dxNorm,
                      y: pt.y + dyNorm,
                    })),
                  }
                : stroke,
            );
            if (moveSyncTimerRef.current !== null) {
              window.clearTimeout(moveSyncTimerRef.current);
            }
            moveSyncTimerRef.current = window.setTimeout(() => {
              moveSyncTimerRef.current = null;
              emitCanvasReplace(next);
            }, 140);
            return next;
          });
          bumpCanvasDirty();
        }}
        onRemoveStroke={(strokeId) => {
          const next = strokes.filter((s) => s.id !== strokeId);
          setUndoHistory((h) => [...h, strokes]);
          setRedoHistory([]);
          setStrokes(next);
          emitCanvasReplace(next);
          bumpCanvasDirty();
        }}
        onReplaceStrokes={(nextStrokes, snapshotToPush) => {
          if (snapshotToPush) {
            setUndoHistory((h) => [...h, snapshotToPush]);
            setRedoHistory([]);
          }
          setStrokes(nextStrokes);
          emitCanvasReplace(nextStrokes);
          bumpCanvasDirty();
        }}
        onUndoStroke={() => {
          if (undoHistory.length === 0) return;
          const prevSnapshot = undoHistory[undoHistory.length - 1];
          setUndoHistory((h) => h.slice(0, -1));
          setRedoHistory((r) => [...r, strokes]);
          setStrokes(prevSnapshot);
          emitCanvasReplace(prevSnapshot);
          bumpCanvasDirty();
        }}
        onRedoStroke={() => {
          if (redoHistory.length === 0) return;
          const nextSnapshot = redoHistory[redoHistory.length - 1];
          setRedoHistory((r) => r.slice(0, -1));
          setUndoHistory((h) => [...h, strokes]);
          setStrokes(nextSnapshot);
          emitCanvasReplace(nextSnapshot);
          bumpCanvasDirty();
        }}
        onClearCanvas={() => {
          setUndoHistory((h) => [...h, strokes]);
          setRedoHistory([]);
          setStrokes([]);
          emitClear();
          bumpCanvasDirty();
        }}
        onSurfaceStyleChange={(style) => {
          setSurfaceStyle(style);
          emitSurfaceStyle(style);
          bumpCanvasDirty();
        }}
        onBoardBgColorChange={(color) => {
          hasManualBgRef.current = true;
          setBoardBgColor(color);
          bumpCanvasDirty();
        }}
        onNotebookWidthModeChange={(mode) => {
          setNotebookWidthMode(mode);
          bumpCanvasDirty();
        }}
        onNotebookPagesChange={(pages) => {
          setNotebookPages(pages);
          bumpCanvasDirty();
        }}
        onSaveSnapshot={(file) => {
          uploadTeacherOnlyRef.current = false;
          void handleUploadFile(file);
        }}
      >
        {/* Spatial Layer inside scrollable board: Attached Questions & Uploaded Materials */}
        <BoardCanvasObjectsLayer
          boardId={board.id}
          boardMode={board.mode}
          isBoardLocked={isBoardLocked}
          questions={board.questions}
          sections={board.sections}
          canControlBoard={canControlBoard}
          canEditMaterials={canControlBoard && !isCancelledOrNoShow}
          isStudent={isStudent}
          allCollapsed={allCardsCollapsed}
          onAnswerQuestion={(q) => setAnsweringQuestion(q)}
          onReviewQuestion={(q) => setReviewQuestion(q)}
          onRemoveQuestion={async (boardQuestionId) => {
            setBoardNotice(null);
            try {
              await removeQuestion.mutateAsync(boardQuestionId);
            } catch (error) {
              setBoardNotice({
                tone: "error",
                message: getErrorMessage(error, "Could not remove question."),
              });
            }
          }}
          onEditNoteSection={openEditNote}
          onRemoveSection={async (sectionId) => {
            setBoardNotice(null);
            try {
              await removeSection.mutateAsync(sectionId);
            } catch (error) {
              setBoardNotice({
                tone: "error",
                message: getErrorMessage(error, "Could not remove material."),
              });
            }
          }}
        />
      </BoardCanvasPanel>

      {/* Floating Top-Left Pill: Session Identity + Lifecycle */}
      <div className="pointer-events-auto absolute top-3 left-3 z-20 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1.5 rounded-2xl border border-border/80 bg-background/92 px-2.5 py-1.5 shadow-sm backdrop-blur-md">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Back to lesson details"
          className="size-7 rounded-xl transition-transform duration-150 active:scale-[0.95]"
          onClick={() => navigate(lessonRoute(lessonId))}
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <PenTool className="size-3.5 shrink-0 text-primary" />
            <span className="max-w-44 truncate text-xs font-semibold text-foreground sm:max-w-56">
              {classroom?.name ?? "Learning Board"}
            </span>
            {lesson ? (
              <span className="hidden text-xs text-muted-foreground tabular-nums md:inline">
                ·{" "}
                {new Date(lesson.scheduledAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}{" "}
                {formatLessonScheduleTimeRange(
                  lesson.scheduledAt,
                  lesson.durationMins,
                )}
              </span>
            ) : null}
          </div>
        </div>

        {lesson ? <LessonStatusBadge status={lesson.status} /> : null}

        {isConnected ? (
          <span
            title="Live collaborative sync active"
            className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sync
          </span>
        ) : null}

        {saveStatus === "saving" ? (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Saving...
          </span>
        ) : saveStatus === "saved" ? (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            Saved
          </span>
        ) : null}

        {lesson?.meetLink ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Open video call"
            className="size-7 rounded-xl"
            onClick={() =>
              window.open(lesson.meetLink!, "_blank", "noopener,noreferrer")
            }
          >
            <Video className="size-3.5 text-primary" />
          </Button>
        ) : null}

        {canControlBoard && lesson?.isScheduled() ? (
          <Button
            type="button"
            size="xs"
            disabled={startLesson.isPending}
            className="h-7 rounded-xl px-2.5 text-xs transition-transform duration-150 active:scale-[0.96]"
            onClick={async () => {
              setBoardNotice(null);
              try {
                await startLesson.mutateAsync(lesson.id);
                setBoardNotice({ tone: "info", message: "Lesson is now Live." });
              } catch (error) {
                setBoardNotice({
                  tone: "error",
                  message: getErrorMessage(error, "Could not start lesson."),
                });
              }
            }}
          >
            <Play className="size-3" />
            Start
          </Button>
        ) : null}

        {canControlBoard && lesson?.isLive() ? (
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={completeLesson.isPending}
            className="h-7 rounded-xl px-2.5 text-xs transition-transform duration-150 active:scale-[0.96]"
            onClick={async () => {
              setBoardNotice(null);
              try {
                await completeLesson.mutateAsync(lesson.id);
                setBoardNotice({
                  tone: "info",
                  message: "Lesson marked completed.",
                });
              } catch (error) {
                setBoardNotice({
                  tone: "error",
                  message: getErrorMessage(error, "Could not complete lesson."),
                });
              }
            }}
          >
            <CheckCircle2 className="size-3" />
            End lesson
          </Button>
        ) : null}
      </div>

      {/* Floating Top-Right Pill: All Board Actions Directly ON the Board */}
      <div className="pointer-events-auto absolute top-3 right-3 z-20 flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/80 bg-background/92 p-1.5 shadow-sm backdrop-blur-md">
        {/* Mode Switcher right on the board */}
        {canControlBoard ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={switchMode.isPending || isCancelledOrNoShow}
                  className="h-7 gap-1.5 rounded-xl px-2.5 text-xs font-medium transition-transform duration-150 active:scale-[0.96]"
                />
              }
            >
              <span className="capitalize">{MODE_LABELS[board.mode]} mode</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {ALL_MODES.map((m) => {
                const isCurrent = board.mode === m.value;
                const isAllowed = allowedNextModes.includes(m.value);
                return (
                  <DropdownMenuItem
                    key={m.value}
                    disabled={isCurrent || !isAllowed || switchMode.isPending}
                    onClick={() => void handleModeSwitch(m.value)}
                  >
                    <span className="flex-1">{m.label}</span>
                    {isCurrent ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Active
                      </Badge>
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant="outline" className="h-7 rounded-xl px-2.5 capitalize">
            {MODE_LABELS[board.mode]}
          </Badge>
        )}

        {/* Lock / Unlock right on the board */}
        {canControlBoard ? (
          <Button
            type="button"
            size="xs"
            variant={isBoardLocked ? "destructive" : "ghost"}
            disabled={toggleLock.isPending || isCancelledOrNoShow}
            aria-label={isBoardLocked ? "Unlock board" : "Lock board"}
            title={isBoardLocked ? "Unlock board" : "Lock board"}
            className="h-7 gap-1 rounded-xl px-2 text-xs transition-transform duration-150 active:scale-[0.96]"
            onClick={() => void handleToggleLock()}
          >
            {isBoardLocked ? (
              <>
                <Unlock className="size-3.5" />
                <span className="hidden sm:inline">Unlock</span>
              </>
            ) : (
              <>
                <Lock className="size-3.5" />
                <span className="hidden sm:inline">Lock</span>
              </>
            )}
          </Button>
        ) : null}

        {/* Attach Question right on the board */}
        {canControlBoard && !isCancelledOrNoShow ? (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="h-7 gap-1 rounded-xl px-2 text-xs transition-transform duration-150 active:scale-[0.96]"
            onClick={() => setQuestionBankOpen(true)}
          >
            <HelpCircle className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Attach question</span>
          </Button>
        ) : null}

        {/* Import / Upload Documents, Images, Notes right on the board */}
        {canControlBoard && !isCancelledOrNoShow ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={uploadMaterial.isPending}
                  className="h-7 gap-1 rounded-xl px-2 text-xs transition-transform duration-150 active:scale-[0.96]"
                />
              }
            >
              <Plus className="size-3.5 text-primary" />
              <span className="hidden sm:inline">
                {uploadMaterial.isPending ? "Uploading..." : "Import"}
              </span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => triggerFilePicker(false)}>
                <FileUp className="size-4" />
                Upload image, PDF or file
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => triggerFilePicker(true)}>
                <EyeOff className="size-4" />
                Upload teacher-only file
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openNewNote}>
                <StickyNote className="size-4" />
                Add sticky note
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setImportOpen(true)}>
                <Copy className="size-4" />
                Import from another lesson
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {/* Lesson Plan Slide-Over Trigger */}
        <Button
          type="button"
          size="xs"
          variant="ghost"
          className="h-7 gap-1 rounded-xl px-2 text-xs transition-transform duration-150 active:scale-[0.96]"
          onClick={() => setPlanDrawerOpen(true)}
        >
          <ClipboardList className="size-3.5" />
          <span className="hidden sm:inline">Plan</span>
          {board.plan.learningObjectives.length > 0 && !board.plan.isCompleted ? (
            <span className="size-1.5 rounded-full bg-primary" />
          ) : null}
        </Button>

        {/* Collapse / Expand On-Board Cards */}
        {totalPinnedCount > 0 ? (
          <Button
            type="button"
            size="xs"
            variant={allCardsCollapsed ? "secondary" : "ghost"}
            className="h-7 gap-1 rounded-xl px-2 text-xs tabular-nums transition-transform duration-150 active:scale-[0.96]"
            title={
              allCardsCollapsed
                ? "Expand attached items on board"
                : "Minimize attached items into pills"
            }
            onClick={() => setAllCardsCollapsed((prev) => !prev)}
          >
            <Layers className="size-3.5" />
            <span>{totalPinnedCount}</span>
          </Button>
        ) : null}

        {/* Fullscreen Board Toggle */}
        <Button
          type="button"
          size="xs"
          variant={isFullscreen ? "secondary" : "ghost"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen board (F)"}
          className="h-7 gap-1 rounded-xl px-2 text-xs transition-transform duration-150 active:scale-[0.96]"
          onClick={() => void toggleFullscreen()}
        >
          {isFullscreen ? (
            <Minimize2 className="size-3.5" />
          ) : (
            <Maximize2 className="size-3.5" />
          )}
        </Button>
      </div>

      {/* Floating Transient Notice Toast (non-shifting) */}
      {boardNotice ? (
        <div className="pointer-events-auto fixed top-20 left-1/2 z-30 -translate-x-1/2">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-md backdrop-blur-md",
              boardNotice.tone === "error"
                ? "border-destructive/40 bg-destructive text-destructive-foreground"
                : "border-border/80 bg-background/95 text-foreground",
            )}
          >
            <span>{boardNotice.message}</span>
            <button
              type="button"
              onClick={() => setBoardNotice(null)}
              aria-label="Dismiss notice"
              className="rounded-full p-0.5 opacity-80 hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Lesson Plan Slide-Over Drawer */}
      <Sheet open={planDrawerOpen} onOpenChange={setPlanDrawerOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Lesson plan</SheetTitle>
            <SheetDescription>
              Objectives, topics, and homework for this lesson.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 pt-2">
            <BoardPlanDrawerContent
              plan={board.plan}
              canEdit={canControlBoard && !isCancelledOrNoShow}
              isSaving={savePlan.isPending}
              isCompleting={completePlan.isPending}
              onSavePlan={async (input) => {
                setBoardNotice(null);
                try {
                  await savePlan.mutateAsync(input);
                  setBoardNotice({
                    tone: "info",
                    message: "Lesson plan saved.",
                  });
                } catch (error) {
                  setBoardNotice({
                    tone: "error",
                    message: getErrorMessage(error, "Could not save plan."),
                  });
                }
              }}
              onCompletePlan={async () => {
                setBoardNotice(null);
                try {
                  await completePlan.mutateAsync();
                  setBoardNotice({
                    tone: "info",
                    message: "Lesson plan marked complete.",
                  });
                } catch (error) {
                  setBoardNotice({
                    tone: "error",
                    message: getErrorMessage(error, "Could not complete plan."),
                  });
                }
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Attach Question from Bank Modal */}
      {canControlBoard ? (
        <AttachQuestionBankDialog
          open={questionBankOpen}
          onOpenChange={setQuestionBankOpen}
          organizationId={organizationId ?? ""}
          attachedQuestionIds={new Set(board.questions.map((q) => q.questionId))}
          isSubmitting={attachQuestion.isPending}
          onAttach={async (payload) => {
            setBoardNotice(null);
            try {
              await attachQuestion.mutateAsync(payload);
              setQuestionBankOpen(false);
              setAllCardsCollapsed(false);
            } catch (error) {
              setBoardNotice({
                tone: "error",
                message: getErrorMessage(error, "Could not attach question."),
              });
            }
          }}
        />
      ) : null}

      {/* Student Answer Dialog (triggered from On-Board Question Card) */}
      {answeringQuestion ? (
        <StudentAnswerDialog
          open={Boolean(answeringQuestion)}
          onOpenChange={(open) => !open && setAnsweringQuestion(null)}
          boardId={board.id}
          question={answeringQuestion}
        />
      ) : null}

      {/* Teacher Responses & Grading Drawer (triggered from On-Board Question Card) */}
      {reviewQuestion ? (
        <TeacherResponsesSheet
          open={Boolean(reviewQuestion)}
          onOpenChange={(open) => !open && setReviewQuestion(null)}
          boardId={board.id}
          question={reviewQuestion}
        />
      ) : null}

      {/* Add / Edit Sticky Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Edit board note" : "Add sticky note to board"}
            </DialogTitle>
            <DialogDescription>
              Notes pin directly onto the board for quick reference during the
              lesson.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="board-sticky-note-input">Note content</Label>
              <Textarea
                id="board-sticky-note-input"
                rows={4}
                placeholder="Write a formula, key theorem, or reminder..."
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                autoFocus
              />
            </div>
            {!editingNote && canControlBoard ? (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={noteTeacherOnly}
                  onCheckedChange={(checked) =>
                    setNoteTeacherOnly(Boolean(checked))
                  }
                />
                <span>Keep private (teacher only)</span>
              </label>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!noteDraft.trim() || addSection.isPending || updateSection.isPending}
              onClick={() => void handleSaveNote()}
            >
              {editingNote ? "Save note" : "Pin to board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import from Another Lesson Dialog */}
      {lesson && organizationId ? (
        <ImportBoardDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          organizationId={organizationId}
          classroomId={lesson.classroomId}
          currentLessonId={lesson.id}
          isSubmitting={importContent.isPending}
          onImport={async (sourceLessonId) => {
            setBoardNotice(null);
            try {
              const sourceBoard =
                await lessonBoardRepository.getByLesson(sourceLessonId);
              await importContent.mutateAsync(sourceBoard.id);
              setBoardNotice({
                tone: "info",
                message: "Content imported from previous lesson board.",
              });
              setImportOpen(false);
            } catch (error) {
              setBoardNotice({
                tone: "error",
                message: getErrorMessage(
                  error,
                  "Could not import board content.",
                ),
              });
            }
          }}
        />
      ) : null}
    </div>
  );
}

function ImportBoardDialog({
  open,
  onOpenChange,
  organizationId,
  classroomId,
  currentLessonId,
  isSubmitting,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  classroomId: string;
  currentLessonId: string;
  isSubmitting: boolean;
  onImport: (sourceLessonId: string) => void;
}) {
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const dateRange = useMemo(() => {
    const now = new Date();
    const past = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      fromDate: past.toISOString(),
      toDate: future.toISOString(),
    };
  }, []);

  const lessonsQuery = useClassroomLessonsQuery(
    organizationId,
    classroomId,
    dateRange,
  );

  const candidates = useMemo(() => {
    return (lessonsQuery.data ?? [])
      .filter((item) => item.id !== currentLessonId)
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      );
  }, [currentLessonId, lessonsQuery.data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import from another lesson</DialogTitle>
          <DialogDescription>
            Bring lesson plan items, notes, and materials from another session
            in this classroom into this board.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="import-lesson-select">Source lesson</Label>
          {lessonsQuery.isPending ? (
            <Skeleton className="h-9 w-full" />
          ) : candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No other lessons were found in this classroom to import from.
            </p>
          ) : (
            <Select
              value={selectedLessonId}
              onValueChange={(value) => setSelectedLessonId(value ?? "")}
            >
              <SelectTrigger id="import-lesson-select">
                <SelectValue placeholder="Choose a source lesson" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {formatLessonScheduleDate(item.scheduledAt)} ·{" "}
                    {item.getFormattedTime()} ({item.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !selectedLessonId}
            onClick={() => onImport(selectedLessonId)}
          >
            {isSubmitting ? "Importing..." : "Import board content"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
