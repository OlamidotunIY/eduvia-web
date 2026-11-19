import {
  WsEventHandler,
  WsEventType,
  type BoardCanvasClearedPayload,
} from "@/shared/api/websocket";
import { boardRealtimeService } from "../services/board-realtime.service";

/** Clears the live collaborative canvas when requested remotely. */
class BoardCanvasClearedHandler extends WsEventHandler<BoardCanvasClearedPayload> {
  readonly eventType = WsEventType.BOARD_CANVAS_CLEARED;

  handle(payload: BoardCanvasClearedPayload): void {
    if (!payload?.boardId) return;
    boardRealtimeService.notifyClear(payload.boardId);
  }
}

export const boardCanvasClearedHandler = new BoardCanvasClearedHandler();
