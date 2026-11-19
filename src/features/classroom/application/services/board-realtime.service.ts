import {
  boardWsConnection,
  lessonWsConnection,
  queryClient,
} from "@/shared/api";
import type { BoardCanvasStroke, BoardSurfaceStyle } from "@/shared/domain";

export interface BoardCanvasSyncCallbacks {
  onRemoteStroke?: (stroke: BoardCanvasStroke) => void;
  onRemoteCanvasReplace?: (strokes: BoardCanvasStroke[]) => void;
  onRemoteClear?: () => void;
  onRemoteSurfaceChange?: (style: BoardSurfaceStyle) => void;
}

class BoardRealtimeService {
  private readonly canvasListeners = new Map<
    string,
    Set<BoardCanvasSyncCallbacks>
  >();

  subscribeCanvas(
    boardId: string,
    callbacks: BoardCanvasSyncCallbacks,
  ): () => void {
    const existing =
      this.canvasListeners.get(boardId) ?? new Set<BoardCanvasSyncCallbacks>();
    existing.add(callbacks);
    this.canvasListeners.set(boardId, existing);

    return () => {
      existing.delete(callbacks);
      if (existing.size === 0) {
        this.canvasListeners.delete(boardId);
      }
    };
  }

  notifyStroke(boardId: string, stroke: BoardCanvasStroke): void {
    this.canvasListeners
      .get(boardId)
      ?.forEach((cb) => cb.onRemoteStroke?.(stroke));
  }

  notifyCanvasReplace(boardId: string, strokes: BoardCanvasStroke[]): void {
    this.canvasListeners
      .get(boardId)
      ?.forEach((cb) => cb.onRemoteCanvasReplace?.(strokes));
  }

  notifyClear(boardId: string): void {
    this.canvasListeners.get(boardId)?.forEach((cb) => cb.onRemoteClear?.());
  }

  notifySurfaceChange(boardId: string, style: BoardSurfaceStyle): void {
    this.canvasListeners
      .get(boardId)
      ?.forEach((cb) => cb.onRemoteSurfaceChange?.(style));
  }
}

export const boardRealtimeService = new BoardRealtimeService();

export function invalidateBoardQueries(): void {
  void queryClient.invalidateQueries({ queryKey: ["boards", "by-lesson"] });
}

export function invalidateLessonQueries(lessonId?: string): void {
  void queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      if (!Array.isArray(key)) return false;
      if (key[2] === "lessons") {
        return !lessonId || key[3] === lessonId;
      }
      return key[4] === "lessons" || key[2] === "calendar-lessons";
    },
  });
}

export function joinLessonRoom(lessonId: string): () => void {
  return lessonWsConnection.joinRoom("lesson:join", "lesson:leave", {
    lessonId,
  });
}

export function joinBoardRoom(boardId: string): () => void {
  return boardWsConnection.joinRoom("board:join", "board:leave", { boardId });
}

export function emitBoardStroke(
  boardId: string,
  stroke: BoardCanvasStroke,
): void {
  boardWsConnection.emit("board:stroke", { boardId, stroke });
}

export function emitBoardCanvasReplace(
  boardId: string,
  strokes: BoardCanvasStroke[],
): void {
  boardWsConnection.emit("board:canvas_replace", { boardId, strokes });
}

export function emitBoardClear(boardId: string): void {
  boardWsConnection.emit("board:clear", { boardId });
}

export function emitBoardSurfaceStyle(
  boardId: string,
  surfaceStyle: BoardSurfaceStyle,
): void {
  boardWsConnection.emit("board:surface", { boardId, surfaceStyle });
}
