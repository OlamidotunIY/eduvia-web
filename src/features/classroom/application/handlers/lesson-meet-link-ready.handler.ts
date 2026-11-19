import {
  WsEventHandler,
  WsEventType,
  type LessonMeetLinkReadyPayload,
} from "@/shared/api/websocket";
import { invalidateLessonQueries } from "../services/board-realtime.service";

/** Refreshes lesson detail queries once the video meeting link becomes ready. */
class LessonMeetLinkReadyHandler extends WsEventHandler<LessonMeetLinkReadyPayload> {
  readonly eventType = WsEventType.LESSON_MEET_LINK_READY;

  handle(payload: LessonMeetLinkReadyPayload): void {
    invalidateLessonQueries(payload?.lessonId);
  }
}

export const lessonMeetLinkReadyHandler = new LessonMeetLinkReadyHandler();
