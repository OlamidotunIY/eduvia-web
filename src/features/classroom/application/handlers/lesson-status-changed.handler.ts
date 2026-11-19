import {
  WsEventHandler,
  WsEventType,
  type LessonStatusChangedPayload,
} from "@/shared/api/websocket";
import { invalidateLessonQueries } from "../services/board-realtime.service";

/** Refreshes lesson state queries when a lesson starts, completes, or cancels. */
class LessonStatusChangedHandler extends WsEventHandler<LessonStatusChangedPayload> {
  readonly eventType = WsEventType.LESSON_STATUS_CHANGED;

  handle(payload: LessonStatusChangedPayload): void {
    invalidateLessonQueries(payload?.lessonId);
  }
}

export const lessonStatusChangedHandler = new LessonStatusChangedHandler();
