import {
  WsEventHandler,
  WsEventType,
  type BoardSectionRemovedPayload,
} from "@/shared/api/websocket";
import { invalidateBoardQueries } from "../services/board-realtime.service";

/** Refreshes board sections when a section is deleted. */
class BoardSectionRemovedHandler extends WsEventHandler<BoardSectionRemovedPayload> {
  readonly eventType = WsEventType.BOARD_SECTION_REMOVED;

  handle(): void {
    invalidateBoardQueries();
  }
}

export const boardSectionRemovedHandler = new BoardSectionRemovedHandler();
