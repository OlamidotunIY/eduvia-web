import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  PenTool,
  Play,
  RotateCcw,
  Video,
  XCircle,
} from "lucide-react";
import { lessonBoardRoute, lessonRoute } from "@/shared/constant/routes.constants";
import type { ClassroomLesson } from "@/shared/domain";
import { sessionStore } from "@/shared/store";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import {
  useCancelLessonMutation,
  useCompleteLessonMutation,
  useStartLessonMutation,
} from "../../application";
import {
  CancelLessonDialog,
  ConfirmLessonActionDialog,
} from "./lesson-lifecycle-dialogs";
import { LessonStatusBadge } from "./lesson-status-badge";
import {
  formatLessonScheduleDate,
  formatLessonScheduleTimeRange,
} from "../utils/lesson-schedule.utils";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function CalendarLessonSheet({
  organizationId,
  lesson,
  classroomName,
  canManage,
  onClose,
  onReschedule,
}: {
  organizationId: string;
  lesson: ClassroomLesson | null;
  classroomName: string;
  canManage: boolean;
  onClose: () => void;
  onReschedule: (lesson: ClassroomLesson) => void;
}) {
  const navigate = useNavigate();
  const currentUser = sessionStore((state) => state.currentUser);
  const currentUserId = currentUser?.user.id;
  const userType = currentUser?.user.userType;
  const orgRole = currentUser?.activeOrganization?.role?.toLowerCase() ?? "";

  const [confirmAction, setConfirmAction] = useState<"start" | "complete" | null>(
    null,
  );
  const [cancelOpen, setCancelOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const startLesson = useStartLessonMutation(
    organizationId,
    lesson?.id,
    lesson?.classroomId,
  );
  const completeLesson = useCompleteLessonMutation(
    organizationId,
    lesson?.id,
    lesson?.classroomId,
  );
  const cancelLesson = useCancelLessonMutation(
    organizationId,
    lesson?.id,
    lesson?.classroomId,
  );

  const isStudent = userType === "student" || orgRole === "student";
  const isAssignedTeacher =
    Boolean(currentUserId) &&
    Boolean(lesson) &&
    (lesson?.teacherId === currentUserId ||
      lesson?.coverTeacherId === currentUserId);
  const canLead =
    !isStudent && (canManage || isAssignedTeacher || orgRole === "teacher");

  const isScheduled = lesson?.isScheduled() ?? false;
  const isLive = lesson?.isLive() ?? false;

  const openBoardLabel = isLive
    ? "Open Live Board"
    : isScheduled
      ? !isStudent
        ? "Prep Board"
        : "Open Learning Board"
      : !isStudent
        ? "View Board & Classwork"
        : "View Lesson Recap";

  return (
    <>
      <Sheet open={Boolean(lesson)} onOpenChange={(open) => !open && onClose()}>
        <SheetContent>
          {lesson ? (
            <>
              <SheetHeader>
                <SheetTitle>{classroomName}</SheetTitle>
                <SheetDescription>
                  {formatLessonScheduleDate(lesson.scheduledAt)} ·{" "}
                  {formatLessonScheduleTimeRange(
                    lesson.scheduledAt,
                    lesson.durationMins,
                  )}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 p-4">
                <div className="flex items-center justify-between border-y border-border py-3.5">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <LessonStatusBadge status={lesson.status} />
                </div>

                {actionError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{actionError}</AlertDescription>
                  </Alert>
                ) : null}

                {lesson.isCancelled() && lesson.cancelledReason ? (
                  <Alert variant="destructive">
                    <XCircle className="size-4" />
                    <AlertDescription>
                      Reason: {lesson.cancelledReason}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Duration</dt>
                    <dd className="font-medium">
                      {lesson.durationMins} minutes
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Lesson type
                    </dt>
                    <dd className="font-medium">
                      {lesson.origin === "ONE_OFF"
                        ? "Extra lesson"
                        : "Recurring lesson"}
                    </dd>
                  </div>
                </dl>

                <div className="space-y-2.5 pt-1">
                  <Button
                    className="w-full"
                    onClick={() => {
                      const targetId = lesson.id;
                      onClose();
                      navigate(lessonRoute(targetId));
                    }}
                  >
                    <ArrowUpRight className="size-4" /> Open Lesson Details
                  </Button>

                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => {
                      const targetId = lesson.id;
                      onClose();
                      navigate(lessonBoardRoute(targetId));
                    }}
                  >
                    <PenTool className="size-4" /> {openBoardLabel}
                  </Button>

                  {lesson.meetLink ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      render={
                        <a
                          href={lesson.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <Video className="size-4" /> Join video call
                      <ExternalLink className="size-3.5" />
                    </Button>
                  ) : null}
                </div>

                {canLead && (isScheduled || isLive) ? (
                  <div className="space-y-2 border-t border-border pt-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Session actions
                    </p>
                    <div className="grid gap-2">
                      {isScheduled ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={startLesson.isPending}
                          onClick={() => setConfirmAction("start")}
                        >
                          <Play className="size-4" /> Start Lesson
                        </Button>
                      ) : null}

                      {isLive ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={completeLesson.isPending}
                          onClick={() => setConfirmAction("complete")}
                        >
                          <CheckCircle2 className="size-4" /> Complete Lesson
                        </Button>
                      ) : null}

                      {isScheduled ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={!canManage}
                          title={
                            canManage
                              ? "Reschedule lesson"
                              : "You need lesson management permission to reschedule a lesson."
                          }
                          onClick={() => {
                            const target = lesson;
                            onClose();
                            onReschedule(target);
                          }}
                        >
                          <RotateCcw className="size-4" /> Reschedule lesson
                        </Button>
                      ) : null}

                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={!canManage}
                        onClick={() => setCancelOpen(true)}
                      >
                        <XCircle className="size-4" /> Cancel lesson
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmLessonActionDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title={
          confirmAction === "start" ? "Start lesson now?" : "Complete lesson?"
        }
        description={
          confirmAction === "start"
            ? "Starting marks the session Live for enrolled learners and opens live collaborative board mode."
            : "Completing ends the live session so homework mode and lesson reporting become available."
        }
        confirmLabel={
          confirmAction === "start" ? "Start lesson" : "Complete lesson"
        }
        isSubmitting={startLesson.isPending || completeLesson.isPending}
        onConfirm={async () => {
          if (!lesson) return;
          setActionError(null);
          try {
            if (confirmAction === "start") {
              await startLesson.mutateAsync(lesson.id);
            } else {
              await completeLesson.mutateAsync(lesson.id);
            }
            setConfirmAction(null);
          } catch (error) {
            setActionError(
              getErrorMessage(error, "Could not update lesson status."),
            );
            setConfirmAction(null);
          }
        }}
      />

      <CancelLessonDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        isSubmitting={cancelLesson.isPending}
        onConfirm={async (reason) => {
          if (!lesson) return;
          setActionError(null);
          try {
            await cancelLesson.mutateAsync({ lessonId: lesson.id, reason });
            setCancelOpen(false);
            onClose();
          } catch (error) {
            setActionError(
              getErrorMessage(error, "Could not cancel lesson."),
            );
            setCancelOpen(false);
          }
        }}
      />
    </>
  );
}
