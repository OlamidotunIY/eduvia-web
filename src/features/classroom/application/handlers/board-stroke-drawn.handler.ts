import {
  WsEventHandler,
  WsEventType,
  type BoardStrokeDrawnPayload,
} from "@/shared/api/websocket";
import { boardRealtimeService } from "../services/board-realtime.service";

/** Dispatches incoming collaborative board strokes to active board views. */
class BoardStrokeDrawnHandler extends WsEventHandler<BoardStrokeDrawnPayload> {
  readonly eventType = WsEventType.BOARD_STROKE_DRAWN;

  handle(payload: BoardStrokeDrawnPayload): void {
    if (!payload?.boardId || !payload?.stroke) return;
    boardRealtimeService.notifyStroke(payload.boardId, payload.stroke);
  }
}

export const boardStrokeDrawnHandler = new BoardStrokeDrawnHandler();
