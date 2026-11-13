import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardContent } from "@/shared/ui/card";
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
import { Separator } from "@/shared/ui/separator";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import {
  CalendarDays,
  Sparkles,
  BookOpen,
  Star,
  Send,
  MessageSquare,
  AlertCircle,
  Maximize2,
  CheckCircle2,
  Loader2,
  Save,
  Eye,
} from "lucide-react";
import {
  useLessonReportDetailQuery,
  useUpdateReportMutation,
  useApproveAiSummaryMutation,
  useSubmitReportMutation,
  useAddLessonReportCommentMutation,
} from "../../application";
import type {
  OrgReportItem,
  ReportAttendanceStatus,
} from "@/shared/domain";
import { lessonReportRoute } from "@/shared/constant/routes.constants";
import { ReportStatusBadge } from "./report-badges";

interface LessonReportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string | null;
  reportMeta?: OrgReportItem | null;
  orgId?: string;
}

export function LessonReportDrawer({
  open,
  onOpenChange,
  reportId,
  reportMeta,
  orgId,
}: LessonReportDrawerProps) {
  const navigate = useNavigate();

  const { data: report, isLoading } = useLessonReportDetailQuery(orgId, reportId);

  const updateMutation = useUpdateReportMutation(orgId ?? "", reportId ?? "");
  const approveAiMutation = useApproveAiSummaryMutation(
    orgId ?? "",
    reportId ?? "",
  );
  const submitMutation = useSubmitReportMutation(orgId ?? "", reportId ?? "");
  const addCommentMutation = useAddLessonReportCommentMutation(
    orgId ?? "",
    reportId ?? "",
  );

  // Local editing state
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
      setActionError(null);
      setActionSuccess(null);
    }
  }, [report]);

  const isSubmitted = report?.status === "submitted";
  const isArchived = report?.status === "archived";

  const showTempSuccess = (msg: string) => {
    setActionError(null);
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleSaveChanges = async () => {
    if (!reportId || !orgId) return;
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
      showTempSuccess("Report changes saved.");
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? err?.message ?? "Failed to save changes.",
      );
    }
  };

  const handleApproveAi = async () => {
    if (!reportId || !orgId) return;
    setActionError(null);
    try {
      await approveAiMutation.mutateAsync(
        isEditingAi ? editedAiSummary : undefined,
      );
      setIsEditingAi(false);
      showTempSuccess("AI summary approved.");
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to approve AI summary.",
      );
    }
  };

  const handleSubmitOfficialReport = async () => {
    if (!reportId || !orgId) return;
    setActionError(null);
    try {
      // Save any pending edits first before submitting
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
          "Failed to submit report. Ensure a teacher narrative or approved AI summary is present.",
      );
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !reportId || !orgId) return;
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

  const handleOpenFullPage = () => {
    if (!reportId) return;
    onOpenChange(false);
    navigate(lessonReportRoute(reportId));
  };

  const formattedDate =
    reportMeta?.lessonScheduledAt || report?.submittedAt || report?.createdAt
      ? new Date(
          reportMeta?.lessonScheduledAt ||
            report?.submittedAt ||
            report!.createdAt,
        ).toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

  const isBusy =
    updateMutation.isPending ||
    approveAiMutation.isPending ||
    submitMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:w-full data-[side=right]:sm:max-w-none data-[side=right]:md:w-[70vw] data-[side=right]:lg:w-[65vw] w-full sm:max-w-none md:w-[70vw] lg:w-[65vw] max-w-none p-0 overflow-hidden flex flex-col bg-background"
      >
        {isLoading || !report ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-2/3 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Drawer Header with Expand Button */}
            <div className="border-b border-border/70 p-5 md:p-6 bg-muted/20 pr-12">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5 gap-1 text-primary border-primary/30 bg-primary/10"
                    >
                      <BookOpen className="size-3" />
                      {reportMeta?.classroomName ||
                        report.classroomName ||
                        "Classroom"}
                    </Badge>
                    <ReportStatusBadge status={report.status} />
                  </div>

                  <SheetTitle className="text-xl font-bold font-heading text-foreground tracking-tight truncate">
                    {reportMeta?.studentName
                      ? `Report: ${reportMeta.studentName}`
                      : "Quick Report Review"}
                  </SheetTitle>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formattedDate}
                    </span>
                    {reportMeta?.teacherName && (
                      <>
                        <span>·</span>
                        <span>
                          Teacher:{" "}
                          <strong className="text-foreground">
                            {reportMeta.teacherName}
                          </strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Expand to Full Page CTA */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenFullPage}
                  className="gap-1.5 text-xs h-8 shrink-0 self-start"
                >
                  <Maximize2 className="size-3.5" />
                  <span>Open Full Page</span>
                </Button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
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

              {/* Quick Attendance & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
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
              </div>

              {/* AI Summary Studio */}
              {(report.aiGeneratedSummary || report.teacherApprovedAiSummary) && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Sparkles className="size-4" />
                      <span>
                        {report.teacherApprovedAiSummary
                          ? "Approved AI Lesson Summary"
                          : "AI Draft Lesson Summary"}
                      </span>
                    </div>

                    {!report.teacherApprovedAiSummary && !isArchived && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setIsEditingAi(!isEditingAi)}
                        >
                          {isEditingAi ? "Cancel Edit" : "Edit Summary"}
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1"
                          disabled={approveAiMutation.isPending}
                          onClick={handleApproveAi}
                        >
                          <CheckCircle2 className="size-3" />
                          {approveAiMutation.isPending
                            ? "Approving..."
                            : "Approve Summary"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditingAi ? (
                    <Textarea
                      value={editedAiSummary}
                      onChange={(e) => setEditedAiSummary(e.target.value)}
                      className="text-xs min-h-[100px]"
                    />
                  ) : (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-4 text-xs md:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                        {report.teacherApprovedAiSummary ||
                          report.aiGeneratedSummary}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Teacher Narrative */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Teacher Observations & Narrative
                </Label>
                <Textarea
                  value={teacherNarrative}
                  onChange={(e) => setTeacherNarrative(e.target.value)}
                  disabled={isArchived}
                  placeholder="Write qualitative notes on student engagement, concept mastery, and performance..."
                  className="text-xs md:text-sm min-h-[100px] resize-y"
                />
              </div>

              {/* Homework & Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Homework Set</Label>
                  <Textarea
                    value={homeworkSet}
                    onChange={(e) => setHomeworkSet(e.target.value)}
                    disabled={isArchived}
                    placeholder="Homework tasks or reading assignments..."
                    className="text-xs min-h-[75px] resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Next Steps</Label>
                  <Textarea
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                    disabled={isArchived}
                    placeholder="Target goals for next session..."
                    className="text-xs min-h-[75px] resize-none"
                  />
                </div>
              </div>

              {/* Parent Sharing Control */}
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 p-3.5">
                <div className="flex items-start gap-2.5">
                  <Eye className="size-4 text-primary mt-0.5" />
                  <div>
                    <Label
                      htmlFor="drawer-parent-can-view"
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Share with Parent Portal
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Allow parents to view this report and feedback notes once submitted.
                    </p>
                  </div>
                </div>
                <Checkbox
                  id="drawer-parent-can-view"
                  checked={parentCanView}
                  disabled={isArchived}
                  onCheckedChange={(checked) =>
                    setParentCanView(Boolean(checked))
                  }
                />
              </div>

              {/* Save & Submit Action Row */}
              {!isArchived && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveChanges}
                    disabled={isBusy}
                    className="gap-1.5 text-xs h-9"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    Save Changes
                  </Button>

                  {!isSubmitted && (
                    <Button
                      size="sm"
                      onClick={handleSubmitOfficialReport}
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
              )}

              <Separator />

              {/* Discussion / Comments Thread */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <MessageSquare className="size-4 text-primary" />
                    <span>Discussion & Feedback Notes</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {report.comments?.length ?? 0} comments
                  </Badge>
                </div>

                <div className="space-y-2.5">
                  {report.comments && report.comments.length > 0 ? (
                    report.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              {comment.authorAvatar && (
                                <AvatarImage src={comment.authorAvatar} />
                              )}
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                {(comment.authorName ?? "U")[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-semibold text-foreground">
                              {comment.authorName || "Staff / Parent"}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 capitalize"
                            >
                              {comment.authorRole}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/90 whitespace-pre-line pl-7">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">
                      No feedback comments posted yet.
                    </p>
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleSendComment} className="space-y-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a note or reply to parent comments..."
                    className="text-xs min-h-[70px] resize-none"
                    disabled={addCommentMutation.isPending}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!commentText.trim() || addCommentMutation.isPending}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Send className="size-3.5" />
                      {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
