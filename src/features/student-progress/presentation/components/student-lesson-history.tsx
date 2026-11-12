import {
  CalendarDays,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  Star,
  Sparkles,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useStudentLessonHistoryQuery } from "../../application";
import type { LessonReportDetail } from "@/shared/domain";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";

interface StudentLessonHistoryProps {
  studentId: string;
  orgId?: string;
  onSelectReport: (reportId: string) => void;
}

export function StudentLessonHistory({
  studentId,
  orgId,
  onSelectReport,
}: StudentLessonHistoryProps) {
  const { data: reports, isLoading } = useStudentLessonHistoryQuery(
    studentId,
    orgId,
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarDays className="size-8 text-muted-foreground/60 mb-2" />
          <h3 className="text-sm font-semibold text-foreground">
            No lesson reports recorded
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Completed lessons and submitted teacher reports for this learner will
            appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {reports.map((report) => {
        const lessonDate = report.submittedAt || report.createdAt;
        const formattedDate = lessonDate
          ? new Date(lessonDate).toLocaleDateString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—";

        const teacherInitials = report.teacherName
          ? report.teacherName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : "TR";

        return (
          <Card
            key={report.id}
            className="border-border/60 hover:border-border transition-all bg-card/60"
          >
            <CardContent className="p-4 md:p-5 flex flex-col gap-3.5">
              {/* Header row: Date, Classroom, Attendance, Rating */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {report.classroomName || "Classroom Lesson"}
                    </h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <CalendarDays className="size-3" />
                      {formattedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AttendanceBadge status={report.attendanceStatus} />
                  {report.overallRating && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 gap-1"
                    >
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      {report.overallRating}/5
                    </Badge>
                  )}
                  {report.scorePercent !== null &&
                    report.scorePercent !== undefined && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-semibold px-2 py-0.5"
                      >
                        Score: {report.scorePercent}%
                      </Badge>
                    )}
                </div>
              </div>

              {/* Middle row: Summary snippet or Teacher narrative snippet */}
              {(report.aiGeneratedSummary || report.teacherNarrative) && (
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                  {report.aiGeneratedSummary && (
                    <p className="line-clamp-2">
                      <strong className="text-foreground font-medium flex items-center gap-1">
                        <Sparkles className="size-3 text-primary inline" />
                        Summary:
                      </strong>{" "}
                      {report.teacherApprovedAiSummary || report.aiGeneratedSummary}
                    </p>
                  )}
                  {report.homeworkSet && (
                    <p className="line-clamp-1 text-[11px] pt-1">
                      <strong className="text-foreground">Homework:</strong>{" "}
                      {report.homeworkSet}
                    </p>
                  )}
                </div>
              )}

              {/* Bottom row: Teacher info & View full report button */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border border-border/60">
                    {report.teacherAvatar && (
                      <AvatarImage
                        src={report.teacherAvatar}
                        alt={report.teacherName}
                      />
                    )}
                    <AvatarFallback className="text-[10px] bg-muted font-medium">
                      {teacherInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground text-xs">
                    Teacher:{" "}
                    <strong className="text-foreground font-medium">
                      {report.teacherName || "Instructor"}
                    </strong>
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectReport(report.id)}
                  className="h-8 px-3 text-xs gap-1.5 font-medium hover:bg-primary/10 hover:text-primary"
                >
                  <FileText className="size-3.5" />
                  View Full Report
                  <ChevronRight className="size-3 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
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
