import {
  WsEventHandler,
  WsEventType,
  type BoardSectionChangedPayload,
} from "@/shared/api/websocket";
import { invalidateBoardQueries } from "../services/board-realtime.service";

/** Refreshes board sections when a teacher adds a new section. */
class BoardSectionAddedHandler extends WsEventHandler<BoardSectionChangedPayload> {
  readonly eventType = WsEventType.BOARD_SECTION_ADDED;

  handle(): void {
    invalidateBoardQueries();
  }
}

export const boardSectionAddedHandler = new BoardSectionAddedHandler();
