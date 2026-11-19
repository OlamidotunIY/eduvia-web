import {
  WsEventHandler,
  WsEventType,
  type BoardSectionChangedPayload,
} from "@/shared/api/websocket";
import { invalidateBoardQueries } from "../services/board-realtime.service";

/** Refreshes board sections when an existing section is updated. */
class BoardSectionUpdatedHandler extends WsEventHandler<BoardSectionChangedPayload> {
  readonly eventType = WsEventType.BOARD_SECTION_UPDATED;

  handle(): void {
    invalidateBoardQueries();
  }
}

export const boardSectionUpdatedHandler = new BoardSectionUpdatedHandler();
