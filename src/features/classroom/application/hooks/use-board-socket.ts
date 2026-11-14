import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { buildUserSocketAuth } from "@/shared/api";
import { WS_BASE_URL } from "@/shared/constant/api-constant";
import type { BoardCanvasStroke, BoardSurfaceStyle } from "@/shared/domain";
import { authStore } from "@/shared/store";
import { boardByLessonQueryKey } from "../queries/use-board.query";
import { lessonDetailQueryKey } from "../queries/use-lesson.query";

interface UseBoardSocketOptions {
  organizationId?: string;
  lessonId?: string;
  boardId?: string;
  onRemoteStroke?: (stroke: BoardCanvasStroke) => void;
  onRemoteCanvasReplace?: (strokes: BoardCanvasStroke[]) => void;
  onRemoteClear?: () => void;
  onRemoteSurfaceChange?: (style: BoardSurfaceStyle) => void;
}

export function useBoardSocket({
  organizationId,
  lessonId,
  boardId,
  onRemoteStroke,
  onRemoteCanvasReplace,
  onRemoteClear,
  onRemoteSurfaceChange,
}: UseBoardSocketOptions) {
  const accessToken = authStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const boardSocketRef = useRef<Socket | null>(null);
  const [connectedBoardId, setConnectedBoardId] = useState<string | null>(null);

  const strokeCbRef = useRef(onRemoteStroke);
  const replaceCbRef = useRef(onRemoteCanvasReplace);
  const clearCbRef = useRef(onRemoteClear);
  const surfaceCbRef = useRef(onRemoteSurfaceChange);

  useEffect(() => {
    strokeCbRef.current = onRemoteStroke;
    replaceCbRef.current = onRemoteCanvasReplace;
    clearCbRef.current = onRemoteClear;
    surfaceCbRef.current = onRemoteSurfaceChange;
  });

  useEffect(() => {
    if (!accessToken || !lessonId) return;

    const lessonSocket = io(`${WS_BASE_URL}/lesson`, {
      auth: buildUserSocketAuth(accessToken),
      transports: ["websocket"],
    });

    lessonSocket.on("connect", () => {
      lessonSocket.emit("lesson:join", { lessonId });
    });

    lessonSocket.on("lesson:status_changed", () => {
      if (organizationId) {
        void queryClient.invalidateQueries({
          queryKey: lessonDetailQueryKey(organizationId, lessonId),
        });
      }
    });

    lessonSocket.on("lesson:meet_link_ready", () => {
      if (organizationId) {
        void queryClient.invalidateQueries({
          queryKey: lessonDetailQueryKey(organizationId, lessonId),
        });
      }
    });

    return () => {
      lessonSocket.emit("lesson:leave", { lessonId });
      lessonSocket.disconnect();
    };
  }, [accessToken, lessonId, organizationId, queryClient]);

  useEffect(() => {
    if (!accessToken || !boardId || !lessonId) {
      return;
    }

    const boardSocket = io(`${WS_BASE_URL}/board`, {
      auth: buildUserSocketAuth(accessToken),
      transports: ["websocket"],
    });
    boardSocketRef.current = boardSocket;

    const refreshBoard = () => {
      void queryClient.invalidateQueries({
        queryKey: boardByLessonQueryKey(lessonId),
      });
    };

    boardSocket.on("connect", () => {
      setConnectedBoardId(boardId);
      boardSocket.emit("board:join", { boardId });
    });

    boardSocket.on("disconnect", () => {
      setConnectedBoardId(null);
    });

    boardSocket.on("board:mode_changed", refreshBoard);
    boardSocket.on("board:lock_changed", refreshBoard);
    boardSocket.on("board:section_added", refreshBoard);
    boardSocket.on("board:section_updated", refreshBoard);
    boardSocket.on("board:section_removed", refreshBoard);

    boardSocket.on(
      "board:stroke_drawn",
      (payload: { stroke?: BoardCanvasStroke }) => {
        if (payload?.stroke) {
          strokeCbRef.current?.(payload.stroke);
        }
      },
    );

    boardSocket.on(
      "board:canvas_replaced",
      (payload: { strokes?: BoardCanvasStroke[] }) => {
        if (Array.isArray(payload?.strokes)) {
          replaceCbRef.current?.(payload.strokes);
        }
      },
    );

    boardSocket.on("board:canvas_cleared", () => {
      clearCbRef.current?.();
    });

    boardSocket.on(
      "board:surface_changed",
      (payload: { surfaceStyle?: BoardSurfaceStyle }) => {
        if (payload?.surfaceStyle) {
          surfaceCbRef.current?.(payload.surfaceStyle);
        }
      },
    );

    return () => {
      boardSocket.emit("board:leave", { boardId });
      boardSocket.disconnect();
      boardSocketRef.current = null;
      setConnectedBoardId(null);
    };
  }, [accessToken, boardId, lessonId, queryClient]);

  const emitStroke = (stroke: BoardCanvasStroke) => {
    if (!boardId) return;
    boardSocketRef.current?.emit("board:stroke", { boardId, stroke });
  };

  const emitCanvasReplace = (strokes: BoardCanvasStroke[]) => {
    if (!boardId) return;
    boardSocketRef.current?.emit("board:canvas_replace", { boardId, strokes });
  };

  const emitClear = () => {
    if (!boardId) return;
    boardSocketRef.current?.emit("board:clear", { boardId });
  };

  const emitSurfaceStyle = (surfaceStyle: BoardSurfaceStyle) => {
    if (!boardId) return;
    boardSocketRef.current?.emit("board:surface", { boardId, surfaceStyle });
  };

  const isConnected = Boolean(
    accessToken && boardId && lessonId && connectedBoardId === boardId,
  );

  return {
    isConnected,
    emitStroke,
    emitCanvasReplace,
    emitClear,
    emitSurfaceStyle,
  };
}
