import { useState } from "react";
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
import { Skeleton } from "@/shared/ui/skeleton";
import { Separator } from "@/shared/ui/separator";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import {
  CalendarDays,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  Star,
  Send,
  MessageSquare,
  AlertCircle,
  FileCheck2,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import {
  useLessonReportQuery,
  useAddReportCommentMutation,
} from "../../application";
import type { LessonReportDetail } from "@/shared/domain";

interface LessonReportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string | null;
  orgId?: string;
}

export function LessonReportDrawer({
  open,
  onOpenChange,
  reportId,
  orgId,
}: LessonReportDrawerProps) {
  const { data: report, isLoading } = useLessonReportQuery(orgId, reportId);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);

  const addCommentMutation = useAddReportCommentMutation(
    orgId ?? "",
    reportId ?? "",
  );

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !reportId || !orgId) return;

    setCommentError(null);
    try {
      await addCommentMutation.mutateAsync({
        content: commentText.trim(),
      });
      setCommentText("");
    } catch (err: any) {
      setCommentError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to send comment. Please try again.",
      );
    }
  };

  const formattedDate = report?.submittedAt || report?.createdAt
    ? new Date(report.submittedAt || report.createdAt).toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

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
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Drawer Header */}
            <div className="border-b border-border/70 p-5 md:p-6 bg-muted/20">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-0.5 gap-1 text-primary border-primary/30 bg-primary/10">
                    <BookOpen className="size-3" />
                    {report.classroomName || "Classroom Lesson"}
                  </Badge>
                  <AttendanceBadge status={report.attendanceStatus} />
                  {report.overallRating && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 gap-1"
                    >
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      {report.overallRating}/5 Rating
                    </Badge>
                  )}
                </div>

                <SheetTitle className="text-xl md:text-2xl font-bold font-heading text-foreground tracking-tight">
                  Lesson Report & Observations
                </SheetTitle>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {formattedDate}
                  </span>
                  <span>·</span>
                  <span>
                    Teacher:{" "}
                    <strong className="text-foreground">
                      {report.teacherName || "Instructor"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="p-5 md:p-6 space-y-6">
              {/* Section 1: AI Generated / Approved Lesson Summary */}
              {(report.teacherApprovedAiSummary || report.aiGeneratedSummary) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Sparkles className="size-4" />
                    <span>
                      {report.teacherApprovedAiSummary
                        ? "Teacher-Approved AI Summary"
                        : "AI Generated Lesson Summary"}
                    </span>
                  </div>
                  <Card className="border-border/60 bg-primary/5">
                    <CardContent className="p-4 text-xs md:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                      {report.teacherApprovedAiSummary || report.aiGeneratedSummary}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Section 2: Teacher Narrative Observations */}
              {report.teacherNarrative && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <FileCheck2 className="size-4 text-blue-500" />
                    <span>Teacher Observations & Narrative</span>
                  </div>
                  <Card className="border-border/60 bg-card/60">
                    <CardContent className="p-4 text-xs md:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                      {report.teacherNarrative}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Section 3: Homework & Next Steps */}
              {(report.homeworkSet || report.nextSteps) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.homeworkSet && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <ListTodo className="size-4 text-amber-500" />
                        <span>Homework & Practice Tasks</span>
                      </div>
                      <Card className="border-border/60 bg-muted/30">
                        <CardContent className="p-4 text-xs md:text-sm text-foreground/90 whitespace-pre-line">
                          {report.homeworkSet}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {report.nextSteps && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <TrendingUp className="size-4 text-emerald-500" />
                        <span>Next Steps for Learner</span>
                      </div>
                      <Card className="border-border/60 bg-muted/30">
                        <CardContent className="p-4 text-xs md:text-sm text-foreground/90 whitespace-pre-line">
                          {report.nextSteps}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}

              {/* Section 4: Assessment Performance Breakdown */}
              {(report.scorePercent !== null || report.assessmentSummary) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <TrendingUp className="size-4 text-primary" />
                    <span>Assessment Breakdown</span>
                  </div>
                  <Card className="border-border/60 bg-card/50">
                    <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">
                          Overall Score
                        </span>
                        <span className="text-lg font-bold text-foreground">
                          {report.scorePercent ?? report.assessmentSummary?.scorePercent ?? 0}%
                        </span>
                      </div>
                      {report.assessmentSummary && (
                        <>
                          <div>
                            <span className="text-[11px] text-muted-foreground block">
                              Attempted
                            </span>
                            <span className="text-lg font-bold text-foreground">
                              {report.assessmentSummary.totalAttempted}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-muted-foreground block">
                              Correct Answers
                            </span>
                            <span className="text-lg font-bold text-emerald-500">
                              {report.assessmentSummary.totalCorrect}
                            </span>
                          </div>
                          {report.assessmentSummary.marksAwarded !== undefined && (
                            <div>
                              <span className="text-[11px] text-muted-foreground block">
                                Marks
                              </span>
                              <span className="text-lg font-bold text-foreground">
                                {report.assessmentSummary.marksAwarded} /{" "}
                                {report.assessmentSummary.maxMarks ?? "—"}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <Separator />

              {/* Section 5: Collaborative Comments Thread */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <MessageSquare className="size-4 text-primary" />
                    <span>Feedback & Discussion Notes</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {report.comments?.length ?? 0} comments
                  </Badge>
                </div>

                {/* Comment list */}
                <div className="space-y-3">
                  {report.comments && report.comments.length > 0 ? (
                    report.comments.map((comment) => {
                      const authorInitials = comment.authorName
                        ? comment.authorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U";

                      return (
                        <div
                          key={comment.id}
                          className="rounded-lg border border-border/50 bg-muted/20 p-3.5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border border-border/60">
                                {comment.authorAvatar && (
                                  <AvatarImage
                                    src={comment.authorAvatar}
                                    alt={comment.authorName}
                                  />
                                )}
                                <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                                  {authorInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-semibold text-foreground">
                                {comment.authorName || "Organization Member"}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 capitalize"
                              >
                                {comment.authorRole}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 whitespace-pre-line pl-8">
                            {comment.content}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
                      No feedback comments posted yet. Add a note or observation below.
                    </div>
                  )}
                </div>

                {/* Comment composer */}
                <form onSubmit={handleSendComment} className="space-y-2 pt-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a feedback note, instruction, or discussion comment..."
                    className="text-xs min-h-[75px] resize-none"
                    disabled={addCommentMutation.isPending}
                  />

                  {commentError && (
                    <Alert variant="destructive" className="py-2 text-xs">
                      <AlertCircle className="size-3.5" />
                      <AlertDescription>{commentError}</AlertDescription>
                    </Alert>
                  )}

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

function AttendanceBadge({
  status,
}: {
  status: LessonReportDetail["attendanceStatus"];
}) {
  switch (status) {
    case "attended":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs px-2 py-0.5 gap-1"
        >
          <CheckCircle2 className="size-3" /> Attended
        </Badge>
      );
    case "late":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 gap-1"
        >
          <Clock className="size-3" /> Late
        </Badge>
      );
    case "absent":
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs px-2 py-0.5 gap-1"
        >
          <XCircle className="size-3" /> Absent
        </Badge>
      );
    case "no_show":
    default:
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs px-2 py-0.5 gap-1"
        >
          <UserX className="size-3" /> No Show
        </Badge>
      );
  }
}
