import {
  WsEventHandler,
  WsEventType,
  type BoardModeChangedPayload,
} from "@/shared/api/websocket";
import { invalidateBoardQueries } from "../services/board-realtime.service";

/** Refreshes active board state when the board collaboration mode changes. */
class BoardModeChangedHandler extends WsEventHandler<BoardModeChangedPayload> {
  readonly eventType = WsEventType.BOARD_MODE_CHANGED;

  handle(): void {
    invalidateBoardQueries();
  }
}

export const boardModeChangedHandler = new BoardModeChangedHandler();
