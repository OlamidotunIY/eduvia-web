import {
  WsEventHandler,
  WsEventType,
  type BoardSurfaceChangedPayload,
} from "@/shared/api/websocket";
import { boardRealtimeService } from "../services/board-realtime.service";

/** Synchronizes board surface background style changes across participants. */
class BoardSurfaceChangedHandler extends WsEventHandler<BoardSurfaceChangedPayload> {
  readonly eventType = WsEventType.BOARD_SURFACE_CHANGED;

  handle(payload: BoardSurfaceChangedPayload): void {
    if (!payload?.boardId || !payload?.surfaceStyle) return;
    boardRealtimeService.notifySurfaceChange(
      payload.boardId,
      payload.surfaceStyle,
    );
  }
}

export const boardSurfaceChangedHandler = new BoardSurfaceChangedHandler();
