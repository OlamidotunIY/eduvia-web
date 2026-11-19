import {
  WsEventHandler,
  WsEventType,
  type BoardCanvasReplacedPayload,
} from "@/shared/api/websocket";
import { boardRealtimeService } from "../services/board-realtime.service";

/** Synchronizes full canvas stroke replacements from collaborative undo/redo/move actions. */
class BoardCanvasReplacedHandler extends WsEventHandler<BoardCanvasReplacedPayload> {
  readonly eventType = WsEventType.BOARD_CANVAS_REPLACED;

  handle(payload: BoardCanvasReplacedPayload): void {
    if (!payload?.boardId || !Array.isArray(payload?.strokes)) return;
    boardRealtimeService.notifyCanvasReplace(payload.boardId, payload.strokes);
  }
}

export const boardCanvasReplacedHandler = new BoardCanvasReplacedHandler();
