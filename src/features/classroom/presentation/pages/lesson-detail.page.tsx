import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileText,
  HelpCircle,
  Lock,
  MoreHorizontal,
  PenTool,
  Play,
  RotateCcw,
  UserCheck,
  UserX,
  Video,
  XCircle,
} from "lucide-react";
import { useOrganizationMembersQuery } from "@/features/organization";
import {
  APP_ROUTES,
  classroomRoute,
  lessonBoardRoute,
} from "@/shared/constant/routes.constants";
import { lessonWsConnection } from "@/shared/api";
import { sessionStore } from "@/shared/store";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  joinLessonRoom,
  useAssignCoverTeacherMutation,
  useBoardByLessonQuery,
  useCancelLessonMutation,
  useClassroomDetailQuery,
  useClassroomStudentsQuery,
  useCompleteLessonMutation,
  useLessonQuery,
  useMarkStudentNoShowMutation,
  useMarkTeacherNoShowMutation,
  useOrganizationSubjectsQuery,
  useRescheduleLessonMutation,
  useStartLessonMutation,
} from "../../application";
import { ScheduleLessonDialog } from "../components/classroom-action-dialogs";
import {
  AssignCoverTeacherDialog,
  CancelLessonDialog,
  ConfirmLessonActionDialog,
} from "../components/lesson-lifecycle-dialogs";
import { LessonStatusBadge } from "../components/lesson-status-badge";
import {
  formatLessonScheduleDate,
  formatLessonScheduleTimeRange,
} from "../utils/lesson-schedule.utils";

type ConfirmKind =
  | "start"
  | "complete"
  | "student-no-show"
  | "teacher-no-show"
  | null;

const BOARD_MODE_LABEL: Record<string, string> = {
  teach: "Teach",
  classwork: "Classwork",
  assignment: "Assignment",
  review: "Review",
  locked: "Locked",
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function formatDateTimeStamp(iso: string | null): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getMemberDisplayName(member: {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  userId: string;
}): string {
  const combined =
    member.fullName?.trim() ||
    [member.firstName, member.lastName].filter(Boolean).join(" ").trim();
  return combined || member.email || member.userId;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const currentUserId = currentUser?.user.id;
  const userType = currentUser?.user.userType;

  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [copiedMeetLink, setCopiedMeetLink] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const lessonQuery = useLessonQuery(organizationId, lessonId);
  const lesson = lessonQuery.data;

  const boardQuery = useBoardByLessonQuery(lessonId);
  const board = boardQuery.data;

  const classroomQuery = useClassroomDetailQuery(
    organizationId,
    lesson?.classroomId,
  );
  const classroom = classroomQuery.data;

  const subjectsQuery = useOrganizationSubjectsQuery(organizationId);
  const studentsQuery = useClassroomStudentsQuery(
    organizationId,
    lesson?.classroomId,
  );
  const membersQuery = useOrganizationMembersQuery(organizationId);

  useEffect(() => {
    if (!lessonId) return;
    return joinLessonRoom(lessonId);
  }, [lessonId]);

  const isLessonSocketConnected = useSyncExternalStore(
    lessonWsConnection.subscribeStatus,
    lessonWsConnection.isConnected,
  );

  const startLesson = useStartLessonMutation(
    organizationId,
    lessonId,
    lesson?.classroomId,
  );
  const completeLesson = useCompleteLessonMutation(
    organizationId,
    lessonId,
    lesson?.classroomId,
  );
  const cancelLesson = useCancelLessonMutation(
    organizationId,
    lessonId,
    lesson?.classroomId,
  );
  const markStudentNoShow = useMarkStudentNoShowMutation(
    organizationId,
    lessonId,
    lesson?.classroomId,
  );
  const markTeacherNoShow = useMarkTeacherNoShowMutation(
    organizationId,
    lessonId,
    lesson?.classroomId,
  );
  const assignCoverTeacher = useAssignCoverTeacherMutation(
    organizationId,
    lessonId,
    lesson?.classroomId,
  );
  const rescheduleLesson = useRescheduleLessonMutation(
    organizationId,
    lesson?.classroomId ?? "",
  );

  const memberNameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of membersQuery.data ?? []) {
      map.set(member.userId, getMemberDisplayName(member));
    }
    return map;
  }, [membersQuery.data]);

  const eligibleCoverTeachers = useMemo(() => {
    return (membersQuery.data ?? [])
      .filter((member) => {
        if (member.status !== "active") return false;
        const role = member.role.toLowerCase();
        return role !== "student" && role !== "parent" && role !== "learner";
      })
      .map((member) => ({
        id: member.userId,
        name: getMemberDisplayName(member),
      }));
  }, [membersQuery.data]);

  const subjectName = classroom?.subjectId
    ? (subjectsQuery.data?.find((item) => item.id === classroom.subjectId)
        ?.name ?? null)
    : null;

  if (lessonQuery.isPending) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 pt-2">
        <div className="space-y-3 border-b border-border pb-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="space-y-4 lg:col-span-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!lesson) {
    return (
      <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start py-16">
        <p className="text-sm font-medium text-primary">Lesson</p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">
          Lesson unavailable
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This lesson could not be loaded or you may no longer have access to
          view it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(APP_ROUTES.CALENDAR)}
          >
            <ArrowLeft className="size-4" /> Back to calendar
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(APP_ROUTES.CLASSROOMS)}
          >
            Go to classrooms
          </Button>
        </div>
      </section>
    );
  }

  const orgRole = currentUser?.activeOrganization?.role?.toLowerCase() ?? "";
  const isStudent = userType === "student" || orgRole === "student";
  const isAssignedTeacher =
    Boolean(currentUserId) &&
    (lesson.teacherId === currentUserId ||
      lesson.coverTeacherId === currentUserId);
  const canManageLessons = permissions.includes("lessons:manage");
  const canLeadLesson =
    !isStudent &&
    (canManageLessons || isAssignedTeacher || orgRole === "teacher");
  const canOpenReports =
    !isStudent &&
    (permissions.includes("reports:read") ||
      permissions.includes("reports:create"));

  const statusUpper = lesson.status.toUpperCase();
  const isScheduled = lesson.isScheduled();
  const isLive = lesson.isLive();
  const isEnded = lesson.isEnded();
  const isCancelled = lesson.isCancelled();
  const isNoShow =
    statusUpper === "STUDENT_NO_SHOW" || statusUpper === "TEACHER_NO_SHOW";

  const boardCtaLabel = isLive
    ? "Open Live Board"
    : isScheduled
      ? "Open Learning Board"
      : isEnded
        ? "Review Board & Work"
        : "Open Learning Board";

  const teacherName =
    memberNameByUserId.get(lesson.teacherId) ??
    (lesson.teacherId === currentUserId ? "You" : "Assigned teacher");
  const coverTeacherName = lesson.coverTeacherId
    ? (memberNameByUserId.get(lesson.coverTeacherId) ?? "Cover teacher")
    : null;
  const activeStudents = (studentsQuery.data ?? []).filter((item) =>
    item.isEnrolled(),
  );

  const visibleSections = (board?.sections ?? []).filter(
    (section) => !isStudent || !section.isTeacherOnly,
  );
  const visibleQuestions = board?.questions ?? [];
  const plan = board?.plan;

  const hasPlanDetails = Boolean(
    plan &&
      (plan.learningObjectives.length > 0 ||
        plan.topicsCovered.length > 0 ||
        plan.homeworkDescription ||
        (!isStudent && plan.teachingNotes)),
  );

  const confirmDialogConfig: Record<
    Exclude<ConfirmKind, null>,
    {
      title: string;
      description: string;
      confirmLabel: string;
      confirmVariant: "default" | "destructive";
      isSubmitting: boolean;
      onConfirm: () => Promise<void>;
    }
  > = {
    start: {
      title: "Start lesson now?",
      description:
        "Starting this lesson marks the session Live for enrolled learners and opens collaborative board teaching.",
      confirmLabel: "Start lesson",
      confirmVariant: "default",
      isSubmitting: startLesson.isPending,
      onConfirm: async () => {
        setActionFeedback(null);
        try {
          await startLesson.mutateAsync(lesson.id);
          setActionFeedback({ tone: "success", message: "Lesson is now Live." });
          setConfirmKind(null);
        } catch (error) {
          setActionFeedback({
            tone: "error",
            message: getErrorMessage(error, "Could not start lesson."),
          });
          setConfirmKind(null);
        }
      },
    },
    complete: {
      title: "Complete lesson?",
      description:
        "Completing ends the live session and allows switching classwork into assignment review and creating lesson reports.",
      confirmLabel: "Complete lesson",
      confirmVariant: "default",
      isSubmitting: completeLesson.isPending,
      onConfirm: async () => {
        setActionFeedback(null);
        try {
          await completeLesson.mutateAsync(lesson.id);
          setActionFeedback({
            tone: "success",
            message: "Lesson marked as completed.",
          });
          setConfirmKind(null);
        } catch (error) {
          setActionFeedback({
            tone: "error",
            message: getErrorMessage(error, "Could not complete lesson."),
          });
          setConfirmKind(null);
        }
      },
    },
    "student-no-show": {
      title: "Mark student no-show?",
      description:
        "This records the session as a student no-show and closes the live lesson.",
      confirmLabel: "Confirm student no-show",
      confirmVariant: "destructive",
      isSubmitting: markStudentNoShow.isPending,
      onConfirm: async () => {
        setActionFeedback(null);
        try {
          await markStudentNoShow.mutateAsync(lesson.id);
          setActionFeedback({
            tone: "success",
            message: "Marked as student no-show.",
          });
          setConfirmKind(null);
        } catch (error) {
          setActionFeedback({
            tone: "error",
            message: getErrorMessage(error, "Could not record no-show."),
          });
          setConfirmKind(null);
        }
      },
    },
    "teacher-no-show": {
      title: "Mark teacher no-show?",
      description:
        "This records the session as a teacher no-show and notifies coordinators.",
      confirmLabel: "Confirm teacher no-show",
      confirmVariant: "destructive",
      isSubmitting: markTeacherNoShow.isPending,
      onConfirm: async () => {
        setActionFeedback(null);
        try {
          await markTeacherNoShow.mutateAsync(lesson.id);
          setActionFeedback({
            tone: "success",
            message: "Marked as teacher no-show.",
          });
          setConfirmKind(null);
        } catch (error) {
          setActionFeedback({
            tone: "error",
            message: getErrorMessage(error, "Could not record no-show."),
          });
          setConfirmKind(null);
        }
      },
    },
  };

  const activeConfirm = confirmKind ? confirmDialogConfig[confirmKind] : null;
  const hasSecondaryActions =
    (canManageLessons && (isScheduled || isLive)) ||
    ((isScheduled || isLive) && canLeadLesson) ||
    (isEnded && canOpenReports);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 pb-12">
      {/* Header bar — clean editorial typographic hierarchy */}
      <header className="flex flex-col gap-6 border-b border-border/80 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <LessonStatusBadge status={lesson.status} />
            {subjectName ? (
              <span className="font-medium text-foreground/80">
                {subjectName}
              </span>
            ) : null}
            <span>
              {lesson.origin === "ONE_OFF"
                ? "Extra session"
                : "Recurring session"}
            </span>
            {isLessonSocketConnected ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live sync
              </span>
            ) : null}
          </div>

          <h1 className="truncate font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {classroom?.name ?? "Lesson Session"}
          </h1>

          <p className="text-sm text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">
              {formatLessonScheduleDate(lesson.scheduledAt)}
            </span>{" "}
            <span aria-hidden="true" className="mx-1.5 text-border">
              /
            </span>
            <span>
              {formatLessonScheduleTimeRange(
                lesson.scheduledAt,
                lesson.durationMins,
              )}
            </span>{" "}
            <span className="text-muted-foreground/80">
              ({lesson.durationMins} min)
            </span>
          </p>
        </div>

        {/* Focused CTA cluster */}
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <Button
            type="button"
            size="lg"
            className="gap-2 transition-transform duration-150 active:scale-[0.97]"
            onClick={() => navigate(lessonBoardRoute(lesson.id))}
          >
            <PenTool className="size-4" />
            {boardCtaLabel}
          </Button>

          {lesson.meetLink ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="gap-2 transition-transform duration-150 active:scale-[0.97]"
              onClick={() =>
                window.open(
                  lesson.meetLink!,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <Video className="size-4" />
              Join Call
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Button>
          ) : null}

          {isScheduled && canLeadLesson ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="gap-2 transition-transform duration-150 active:scale-[0.97]"
              onClick={() => setConfirmKind("start")}
            >
              <Play className="size-4" />
              Start Lesson
            </Button>
          ) : null}

          {isLive && canLeadLesson ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="gap-2 transition-transform duration-150 active:scale-[0.97]"
              onClick={() => setConfirmKind("complete")}
            >
              <CheckCircle2 className="size-4" />
              Complete Lesson
            </Button>
          ) : null}

          {hasSecondaryActions ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 transition-transform duration-150 active:scale-[0.97]"
                    aria-label="More lesson actions"
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {isScheduled && canManageLessons ? (
                  <>
                    <DropdownMenuItem onClick={() => setRescheduleOpen(true)}>
                      <RotateCcw className="size-4" />
                      Reschedule lesson
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCoverOpen(true)}>
                      <UserCheck className="size-4" />
                      {coverTeacherName
                        ? "Change cover teacher"
                        : "Assign cover teacher"}
                    </DropdownMenuItem>
                  </>
                ) : null}

                {isEnded && canOpenReports ? (
                  <DropdownMenuItem
                    onClick={() => navigate(APP_ROUTES.LESSON_REPORTS)}
                  >
                    <FileText className="size-4" />
                    Lesson reports
                  </DropdownMenuItem>
                ) : null}

                {(isScheduled || isLive) && canLeadLesson ? (
                  <>
                    {isScheduled && canManageLessons ? (
                      <DropdownMenuSeparator />
                    ) : null}
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setConfirmKind("student-no-show")}
                    >
                      <UserX className="size-4" />
                      Student no-show
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setConfirmKind("teacher-no-show")}
                    >
                      <UserX className="size-4" />
                      Teacher no-show
                    </DropdownMenuItem>
                  </>
                ) : null}

                {isScheduled && canManageLessons ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setCancelOpen(true)}
                    >
                      <XCircle className="size-4" />
                      Cancel lesson
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </header>

      {/* Contextual Notices */}
      {actionFeedback ? (
        <Alert
          variant={actionFeedback.tone === "error" ? "destructive" : "default"}
        >
          <AlertTitle>
            {actionFeedback.tone === "error" ? "Action failed" : "Updated"}
          </AlertTitle>
          <AlertDescription>{actionFeedback.message}</AlertDescription>
        </Alert>
      ) : null}

      {isCancelled && lesson.cancelledReason ? (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>Lesson cancelled</AlertTitle>
          <AlertDescription>{lesson.cancelledReason}</AlertDescription>
        </Alert>
      ) : null}

      {isNoShow ? (
        <Alert>
          <AlertTriangle className="size-4" />
          <AlertTitle>
            {statusUpper === "STUDENT_NO_SHOW"
              ? "Student no-show recorded"
              : "Teacher no-show recorded"}
          </AlertTitle>
          <AlertDescription>
            This session ended without regular completion and stays archived for
            attendance review.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Main Asymmetric Editorial Layout */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left Primary Column (~65%): Plan + Questions & Materials */}
        <div className="space-y-10 lg:col-span-8">
          {/* Lesson Plan Section */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="font-sans text-lg font-semibold tracking-tight">
                  Lesson plan
                </h2>
                {plan?.isCompleted ? (
                  <Badge
                    variant="outline"
                    className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="size-3" /> Completed
                  </Badge>
                ) : null}
              </div>

              {!isStudent ? (
                <Link
                  to={lessonBoardRoute(lesson.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Edit on board
                  <ArrowUpRight className="size-3.5" />
                </Link>
              ) : null}
            </div>

            {boardQuery.isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : !hasPlanDetails ? (
              <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                No lesson plan written yet. Open the Learning Board to add
                learning objectives, topics, notes, or homework.
              </p>
            ) : (
              <div className="space-y-5">
                {plan?.learningObjectives.length ? (
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground">
                      Learning objectives
                    </h3>
                    <ul className="space-y-2 text-sm text-foreground">
                      {plan.learningObjectives.map((objective, idx) => (
                        <li
                          key={`${objective}-${idx}`}
                          className="flex items-start gap-2.5"
                        >
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary tabular-nums">
                            {idx + 1}
                          </span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {plan?.topicsCovered.length ? (
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground">
                      Topics covered
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.topicsCovered.map((topic, idx) => (
                        <span
                          key={`${topic}-${idx}`}
                          className="rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {plan?.homeworkDescription ? (
                  <div className="border-l-2 border-primary/60 pl-4">
                    <h3 className="text-xs font-medium text-primary">
                      Homework
                    </h3>
                    <p className="mt-1 whitespace-pre-line text-sm text-foreground">
                      {plan.homeworkDescription}
                    </p>
                  </div>
                ) : null}

                {!isStudent && plan?.teachingNotes ? (
                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3">
                    <h3 className="text-xs font-medium text-amber-800 dark:text-amber-300">
                      Private teacher notes
                    </h3>
                    <p className="mt-1 whitespace-pre-line text-sm text-foreground">
                      {plan.teachingNotes}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <hr className="border-border/70" />

          {/* Attached Questions & Materials Summary */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h2 className="font-sans text-lg font-semibold tracking-tight">
                  On the board
                </h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {visibleQuestions.length} question
                  {visibleQuestions.length === 1 ? "" : "s"} ·{" "}
                  {visibleSections.length} material
                  {visibleSections.length === 1 ? "" : "s"}
                </span>
              </div>

              <Link
                to={lessonBoardRoute(lesson.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Open board
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {visibleQuestions.length === 0 && visibleSections.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                No questions, files, or notes are pinned to this board yet.
              </p>
            ) : (
              <div className="divide-y divide-border/70 rounded-xl border border-border/80 bg-card">
                {visibleQuestions.map((bq, idx) => (
                  <Link
                    key={bq.id}
                    to={lessonBoardRoute(lesson.id)}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary tabular-nums">
                        Q{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {bq.question?.stem ?? "Attached question"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize tabular-nums">
                          {bq.mode} · {bq.maxMarks} marks
                        </p>
                      </div>
                    </div>
                    <HelpCircle className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}

                {visibleSections.map((sec) => {
                  const firstLine =
                    sec.content.split("\n")[0] || "Board material";
                  return (
                    <Link
                      key={sec.id}
                      to={lessonBoardRoute(lesson.id)}
                      className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          {sec.type === "image" ? (
                            <ClipboardList className="size-3.5" />
                          ) : (
                            <FileText className="size-3.5" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {sec.type === "image"
                              ? "Uploaded image"
                              : firstLine}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {sec.isTeacherOnly ? "Teacher only" : sec.type}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Contextual Rail (~35%) */}
        <aside className="space-y-8 lg:col-span-4 lg:border-l lg:border-border/70 lg:pl-8">
          {/* Board State */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-medium text-muted-foreground">
              Learning board
            </h2>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {BOARD_MODE_LABEL[board?.mode ?? "teach"] ?? "Teach"} mode
                </span>
                {board?.isLocked ? (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Lock className="size-3" /> Locked
                  </Badge>
                ) : null}
              </div>
              <Link
                to={lessonBoardRoute(lesson.id)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Open →
              </Link>
            </div>
          </div>

          {/* People */}
          <div className="space-y-3 border-t border-border/70 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium text-muted-foreground">
                People
              </h2>
              <Link
                to={classroomRoute(lesson.classroomId)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Classroom
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(teacherName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {teacherName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Assigned teacher
                  </p>
                </div>
              </div>

              {coverTeacherName ? (
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {getInitials(coverTeacherName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {coverTeacherName}
                    </p>
                    <p className="text-xs text-primary">Cover teacher</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pt-2">
              <p className="mb-2 text-xs text-muted-foreground tabular-nums">
                {activeStudents.length} learner
                {activeStudents.length === 1 ? "" : "s"}
              </p>
              {activeStudents.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No enrolled learners yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {activeStudents.slice(0, 8).map((student) => (
                    <li
                      key={student.id}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <Avatar size="sm">
                        <AvatarFallback>
                          {student.getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-foreground">
                        {student.getDisplayName()}
                      </span>
                    </li>
                  ))}
                  {activeStudents.length > 8 ? (
                    <li className="text-xs text-muted-foreground">
                      +{activeStudents.length - 8} more enrolled
                    </li>
                  ) : null}
                </ul>
              )}
            </div>
          </div>

          {/* Meeting Link & Audit Timeline */}
          <div className="space-y-4 border-t border-border/70 pt-6">
            {lesson.meetLink ? (
              <div className="space-y-1.5">
                <h2 className="text-xs font-medium text-muted-foreground">
                  Video call link
                </h2>
                <div className="flex items-center gap-2">
                  <a
                    href={lesson.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-xs text-primary hover:underline"
                  >
                    {lesson.meetLink}
                  </a>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      void navigator.clipboard.writeText(lesson.meetLink ?? "");
                      setCopiedMeetLink(true);
                    }}
                  >
                    {copiedMeetLink ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <h2 className="text-xs font-medium text-muted-foreground">
                Timeline
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs tabular-nums">
                <div>
                  <dt className="text-muted-foreground">Scheduled</dt>
                  <dd className="font-medium text-foreground">
                    {formatDateTimeStamp(lesson.scheduledAt) ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Started</dt>
                  <dd className="font-medium text-foreground">
                    {formatDateTimeStamp(lesson.startedAt) ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Completed</dt>
                  <dd className="font-medium text-foreground">
                    {formatDateTimeStamp(lesson.completedAt) ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reported</dt>
                  <dd className="font-medium text-foreground">
                    {formatDateTimeStamp(lesson.reportedAt) ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>

            {lesson.classroomId ? (
              <div className="pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-2 h-8 gap-1.5 text-xs text-muted-foreground"
                  onClick={() => navigate(APP_ROUTES.CALENDAR)}
                >
                  <CalendarClock className="size-3.5" />
                  Back to calendar
                </Button>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Dialogs */}
      {activeConfirm ? (
        <ConfirmLessonActionDialog
          open={Boolean(confirmKind)}
          onOpenChange={(open) => {
            if (!open) setConfirmKind(null);
          }}
          title={activeConfirm.title}
          description={activeConfirm.description}
          confirmLabel={activeConfirm.confirmLabel}
          confirmVariant={activeConfirm.confirmVariant}
          isSubmitting={activeConfirm.isSubmitting}
          onConfirm={activeConfirm.onConfirm}
        />
      ) : null}

      <CancelLessonDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        isSubmitting={cancelLesson.isPending}
        onConfirm={async (reason) => {
          setActionFeedback(null);
          try {
            await cancelLesson.mutateAsync({ lessonId: lesson.id, reason });
            setActionFeedback({
              tone: "success",
              message: "Lesson cancelled.",
            });
            setCancelOpen(false);
          } catch (error) {
            setActionFeedback({
              tone: "error",
              message: getErrorMessage(error, "Could not cancel lesson."),
            });
          }
        }}
      />

      <AssignCoverTeacherDialog
        open={coverOpen}
        onOpenChange={setCoverOpen}
        teachers={eligibleCoverTeachers}
        currentCoverTeacherId={lesson.coverTeacherId}
        isSubmitting={assignCoverTeacher.isPending}
        onConfirm={async (teacherId) => {
          setActionFeedback(null);
          try {
            await assignCoverTeacher.mutateAsync(teacherId);
            setActionFeedback({
              tone: "success",
              message: "Cover teacher assigned.",
            });
            setCoverOpen(false);
          } catch (error) {
            setActionFeedback({
              tone: "error",
              message: getErrorMessage(
                error,
                "Could not assign cover teacher.",
              ),
            });
          }
        }}
      />

      <ScheduleLessonDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        mode="reschedule"
        initialLesson={lesson}
        isSubmitting={rescheduleLesson.isPending}
        onSubmit={async (values) => {
          setActionFeedback(null);
          try {
            await rescheduleLesson.mutateAsync({
              lessonId: lesson.id,
              scheduledAt: values.scheduledAt,
              durationMins: values.durationMins,
            });
            await lessonQuery.refetch();
            setActionFeedback({
              tone: "success",
              message: "Lesson rescheduled.",
            });
            setRescheduleOpen(false);
          } catch (error) {
            setActionFeedback({
              tone: "error",
              message: getErrorMessage(error, "Could not reschedule lesson."),
            });
          }
        }}
      />
    </section>
  );
}
