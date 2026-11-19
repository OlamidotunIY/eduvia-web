import {
  WsEventHandler,
  WsEventType,
  type BoardLockChangedPayload,
} from "@/shared/api/websocket";
import { invalidateBoardQueries } from "../services/board-realtime.service";

/** Refreshes active board state when board lock status changes. */
class BoardLockChangedHandler extends WsEventHandler<BoardLockChangedPayload> {
  readonly eventType = WsEventType.BOARD_LOCK_CHANGED;

  handle(): void {
    invalidateBoardQueries();
  }
}

export const boardLockChangedHandler = new BoardLockChangedHandler();
