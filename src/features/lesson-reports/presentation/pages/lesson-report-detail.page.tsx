import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sessionStore } from "@/shared/store";
import {
  useLessonReportDetailQuery,
  useOrgReportsQuery,
  useUpdateReportMutation,
  useApproveAiSummaryMutation,
  useSubmitReportMutation,
  useAddLessonReportCommentMutation,
} from "../../application";
import {
  APP_ROUTES,
  studentProgressRoute,
} from "@/shared/constant/routes.constants";
import type { ReportAttendanceStatus } from "@/shared/domain";
import { ReportStatusBadge } from "../components/report-badges";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  ListTodo,
  TrendingUp,
  Eye,
  Star,
  Send,
  MessageSquare,
  AlertCircle,
  Loader2,
  Save,
  Printer,
  UserRound,
  ExternalLink,
  Clock,
} from "lucide-react";

export function LessonReportDetailPage() {
  const { reportId = "" } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;

  const { data: report, isLoading } = useLessonReportDetailQuery(
    organizationId,
    reportId,
  );
  const { data: orgReportsData } = useOrgReportsQuery(organizationId);

  const reportMeta = useMemo(
    () => orgReportsData?.reports.find((r) => r.id === reportId) ?? null,
    [orgReportsData, reportId],
  );

  const updateMutation = useUpdateReportMutation(organizationId ?? "", reportId);
  const approveAiMutation = useApproveAiSummaryMutation(
    organizationId ?? "",
    reportId,
  );
  const submitMutation = useSubmitReportMutation(organizationId ?? "", reportId);
  const addCommentMutation = useAddLessonReportCommentMutation(
    organizationId ?? "",
    reportId,
  );

  // Local form state
  const [attendanceStatus, setAttendanceStatus] =
    useState<ReportAttendanceStatus>("attended");
  const [overallRating, setOverallRating] = useState<number>(5);
  const [teacherNarrative, setTeacherNarrative] = useState("");
  const [homeworkSet, setHomeworkSet] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [parentCanView, setParentCanView] = useState(false);

  const [isEditingAi, setIsEditingAi] = useState(false);
  const [editedAiSummary, setEditedAiSummary] = useState("");

  const [commentText, setCommentText] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (report) {
      setAttendanceStatus(report.attendanceStatus);
      setOverallRating(report.overallRating ?? 5);
      setTeacherNarrative(report.teacherNarrative ?? "");
      setHomeworkSet(report.homeworkSet ?? "");
      setNextSteps(report.nextSteps ?? "");
      setParentCanView(report.parentCanView);
      setEditedAiSummary(
        report.teacherApprovedAiSummary ?? report.aiGeneratedSummary ?? "",
      );
      setIsEditingAi(false);
    }
  }, [report]);

  const showTempSuccess = (msg: string) => {
    setActionError(null);
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const isSubmitted = report?.status === "submitted";
  const isArchived = report?.status === "archived";
  const isBusy =
    updateMutation.isPending ||
    approveAiMutation.isPending ||
    submitMutation.isPending;

  const handleSave = async () => {
    if (!organizationId || !reportId) return;
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        attendanceStatus,
        overallRating,
        teacherNarrative,
        homeworkSet: homeworkSet.trim() || null,
        nextSteps: nextSteps.trim() || null,
        parentCanView,
      });
      showTempSuccess("Report changes saved successfully.");
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? err?.message ?? "Failed to save changes.",
      );
    }
  };

  const handleApproveAi = async () => {
    if (!organizationId || !reportId) return;
    setActionError(null);
    try {
      await approveAiMutation.mutateAsync(
        isEditingAi ? editedAiSummary : undefined,
      );
      setIsEditingAi(false);
      showTempSuccess("AI summary approved and finalized.");
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to approve AI summary.",
      );
    }
  };

  const handleSubmitOfficial = async () => {
    if (!organizationId || !reportId) return;
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        attendanceStatus,
        overallRating,
        teacherNarrative,
        homeworkSet: homeworkSet.trim() || null,
        nextSteps: nextSteps.trim() || null,
        parentCanView,
      });
      await submitMutation.mutateAsync();
      showTempSuccess("Lesson report submitted officially!");
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ??
          err?.message ??
          "Cannot submit report. Add a teacher narrative or approve an AI summary first.",
      );
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !organizationId || !reportId) return;
    setActionError(null);
    try {
      await addCommentMutation.mutateAsync({ content: commentText.trim() });
      setCommentText("");
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to post comment.",
      );
    }
  };

  if (isLoading || !report) {
    return (
      <div className="space-y-6 w-full">
        <Skeleton className="h-9 w-48 rounded-md" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const lessonDateStr =
    reportMeta?.lessonScheduledAt || report.submittedAt || report.createdAt;
  const formattedDate = new Date(lessonDateStr).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const studentName = reportMeta?.studentName || "Learner";
  const teacherName =
    reportMeta?.teacherName || report.teacherName || "Instructor";
  const classroomName =
    reportMeta?.classroomName || report.classroomName || "Classroom";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 w-full pb-10">
      {/* Top Action & Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(APP_ROUTES.LESSON_REPORTS)}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground w-fit h-8 px-2"
          >
            <ArrowLeft className="size-3.5" />
            Back to Lesson Reports
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-foreground">
              Lesson Report: {studentName}
            </h1>
            <ReportStatusBadge status={report.status} />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="gap-1 text-xs font-normal">
              <BookOpen className="size-3" />
              {classroomName}
            </Badge>
            {reportMeta?.subjectName && (
              <Badge variant="secondary" className="text-xs font-normal">
                {reportMeta.subjectName}
              </Badge>
            )}
            <span className="flex items-center gap-1 ml-1">
              <CalendarDays className="size-3.5" />
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 text-xs h-9"
          >
            <Printer className="size-3.5" />
            Print / Export
          </Button>

          {!isArchived && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isBusy}
              className="gap-1.5 text-xs h-9"
            >
              {updateMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save Draft
            </Button>
          )}

          {!isSubmitted && !isArchived && (
            <Button
              size="sm"
              onClick={handleSubmitOfficial}
              disabled={isBusy}
              className="gap-1.5 text-xs h-9"
            >
              {submitMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Submit Official Report
            </Button>
          )}
        </div>
      </div>

      {/* Inline alerts */}
      {actionError && (
        <Alert variant="destructive" className="py-2.5 text-xs">
          <AlertCircle className="size-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}
      {actionSuccess && (
        <Alert className="py-2.5 text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="size-4" />
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Two-Column Full Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Main Column: Narratives, AI Summary, Homework & Assessment */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* AI Summary Studio */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <Sparkles className="size-4" />
                  AI Lesson Summary Studio
                </CardTitle>
                <CardDescription className="text-xs">
                  {report.teacherApprovedAiSummary
                    ? "Approved summary ready for parent and learner review."
                    : report.aiGeneratedSummary
                      ? "Review the AI-generated draft below, edit if needed, and approve."
                      : "No AI summary generated yet for this report."}
                </CardDescription>
              </div>

              {report.aiGeneratedSummary &&
                !report.teacherApprovedAiSummary &&
                !isArchived && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setIsEditingAi(!isEditingAi)}
                    >
                      {isEditingAi ? "Cancel Edit" : "Edit Summary"}
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      disabled={approveAiMutation.isPending}
                      onClick={handleApproveAi}
                    >
                      <CheckCircle2 className="size-3.5" />
                      {approveAiMutation.isPending
                        ? "Approving..."
                        : "Approve AI Summary"}
                    </Button>
                  </div>
                )}
            </CardHeader>
            <CardContent>
              {!report.aiGeneratedSummary && !report.teacherApprovedAiSummary ? (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-5 text-center text-xs text-muted-foreground">
                  AI summaries are automatically drafted after lesson completion or classwork marking. You can still complete and submit using the teacher narrative below.
                </div>
              ) : isEditingAi ? (
                <Textarea
                  value={editedAiSummary}
                  onChange={(e) => setEditedAiSummary(e.target.value)}
                  className="text-sm min-h-[140px]"
                />
              ) : (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {report.teacherApprovedAiSummary || report.aiGeneratedSummary}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teacher Observations & Narrative */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileCheck2 className="size-4 text-blue-500" />
                Teacher Observations & Narrative
              </CardTitle>
              <CardDescription className="text-xs">
                Detailed qualitative feedback on learner comprehension, behavior, strengths, and areas to reinforce.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={teacherNarrative}
                onChange={(e) => setTeacherNarrative(e.target.value)}
                disabled={isArchived}
                placeholder="Write a comprehensive evaluation of how the student performed during this lesson..."
                className="text-sm min-h-[160px] leading-relaxed"
              />
            </CardContent>
          </Card>

          {/* Homework & Action Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/60 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ListTodo className="size-4 text-amber-500" />
                  Homework Assigned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={homeworkSet}
                  onChange={(e) => setHomeworkSet(e.target.value)}
                  disabled={isArchived}
                  placeholder="Exercises, chapters, or assignments due before next class..."
                  className="text-xs md:text-sm min-h-[110px]"
                />
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-500" />
                  Next Steps & Targets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  disabled={isArchived}
                  placeholder="Recommended focus topics and milestones for upcoming sessions..."
                  className="text-xs md:text-sm min-h-[110px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Assessment Performance Breakdown */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Assessment & Classwork Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.assessmentSummary &&
              report.assessmentSummary.totalAttempted > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-lg border bg-muted/20 p-3.5">
                    <span className="text-xs text-muted-foreground block">
                      Score
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      {report.scorePercent ??
                        report.assessmentSummary.scorePercent ??
                        0}
                      %
                    </span>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3.5">
                    <span className="text-xs text-muted-foreground block">
                      Questions Attempted
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      {report.assessmentSummary.totalAttempted}
                    </span>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3.5">
                    <span className="text-xs text-muted-foreground block">
                      Correct Answers
                    </span>
                    <span className="text-2xl font-bold text-emerald-500">
                      {report.assessmentSummary.totalCorrect}
                    </span>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3.5">
                    <span className="text-xs text-muted-foreground block">
                      Marks
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      {report.assessmentSummary.marksAwarded ?? "—"} /{" "}
                      {report.assessmentSummary.maxMarks ?? "—"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 p-5 text-center text-xs text-muted-foreground">
                  No scored assessment or classwork was attached to this lesson session.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Learner Meta, Attendance & Rating, Governance, Comments */}
        <div className="flex flex-col gap-6">
          {/* Learner & Classroom Card */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserRound className="size-4 text-primary" />
                Learner & Session Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border border-border/60">
                  {reportMeta?.studentAvatar && (
                    <AvatarImage src={reportMeta.studentAvatar} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {studentName[0]?.toUpperCase() ?? "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {studentName}
                  </p>
                  {reportMeta?.studentEmail && (
                    <p className="text-xs text-muted-foreground truncate">
                      {reportMeta.studentEmail}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 gap-1.5"
                onClick={() => navigate(studentProgressRoute(report.studentId))}
              >
                <span>Open Learner Progress Profile</span>
                <ExternalLink className="size-3" />
              </Button>

              <div className="border-t border-border/50 pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teacher:</span>
                  <span className="font-medium text-foreground">{teacherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Classroom:</span>
                  <span className="font-medium text-foreground">{classroomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-foreground">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {report.submittedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="text-emerald-500 font-medium">
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance & Rating Card */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Attendance & Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Attendance Status</Label>
                <Select
                  value={attendanceStatus}
                  disabled={isArchived}
                  onValueChange={(val) =>
                    setAttendanceStatus(
                      (val as ReportAttendanceStatus) ?? "attended",
                    )
                  }
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attended" className="text-xs">
                      Attended
                    </SelectItem>
                    <SelectItem value="late" className="text-xs">
                      Late
                    </SelectItem>
                    <SelectItem value="absent" className="text-xs">
                      Absent
                    </SelectItem>
                    <SelectItem value="no_show" className="text-xs">
                      No Show
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Lesson Rating</Label>
                <div className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-transparent">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={isArchived}
                      onClick={() => setOverallRating(star)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`size-4 ${
                          star <= overallRating
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-semibold text-muted-foreground">
                    {overallRating} / 5
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Sharing & Visibility Governance */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="size-4 text-primary" />
                Parent Portal Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="detail-parent-can-view"
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Visible to Parents
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Allows linked parents to view summary, homework, and comment thread after submission.
                  </p>
                </div>
                <Checkbox
                  id="detail-parent-can-view"
                  checked={parentCanView}
                  disabled={isArchived}
                  onCheckedChange={(checked) =>
                    setParentCanView(Boolean(checked))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Comments & Discussion Thread */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                Discussion Notes
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {report.comments?.length ?? 0}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {report.comments && report.comments.length > 0 ? (
                  report.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">
                            {comment.authorName || "Staff / Parent"}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 capitalize"
                          >
                            {comment.authorRole}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">
                    No comments yet.
                  </p>
                )}
              </div>

              <form onSubmit={handleSendComment} className="space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment or parent note..."
                  className="text-xs min-h-[75px] resize-none"
                  disabled={addCommentMutation.isPending}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="w-full gap-1.5 text-xs h-8"
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                >
                  <Send className="size-3.5" />
                  {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
