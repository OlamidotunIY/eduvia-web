import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Star,
  Eye,
  Lock,
  Maximize2,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import type { OrgReportItem, OrgReportsFilterOption } from "@/shared/domain";
import {
  DataTable,
  type DataTableFeatures,
} from "@/shared/composites/data-table";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { lessonReportRoute } from "@/shared/constant/routes.constants";
import {
  ReportStatusBadge,
  ReportAttendanceBadge,
} from "./report-badges";

const columns = createColumnHelper<DataTableFeatures, OrgReportItem>();

const columnLabels = {
  learner: "Learner",
  classroom: "Classroom & Subject",
  lessonDate: "Lesson Date",
  teacher: "Teacher",
  status: "Report Status",
  attendance: "Attendance",
  rating: "Rating & Score",
  parentAccess: "Visibility",
  actions: "Action",
};

interface LessonReportsTableProps {
  reports: OrgReportItem[];
  isLoading?: boolean;
  isReloading?: boolean;
  onReload?: () => void;
  onSelectReport: (reportId: string) => void;
  selectedClassroomId?: string;
  onSelectClassroom?: (classroomId: string | undefined) => void;
  selectedSubjectId?: string;
  onSelectSubject?: (subjectId: string | undefined) => void;
  selectedAttendance?: string;
  onSelectAttendance?: (status: string) => void;
  availableClassrooms?: OrgReportsFilterOption[];
  availableSubjects?: OrgReportsFilterOption[];
}

export function LessonReportsTable({
  reports,
  isLoading,
  isReloading,
  onReload,
  onSelectReport,
  selectedClassroomId,
  onSelectClassroom,
  selectedSubjectId,
  onSelectSubject,
  selectedAttendance = "all",
  onSelectAttendance,
  availableClassrooms = [],
  availableSubjects = [],
}: LessonReportsTableProps) {
  const navigate = useNavigate();

  const isFiltered =
    Boolean(selectedClassroomId) ||
    Boolean(selectedSubjectId) ||
    selectedAttendance !== "all";

  const onResetFilters = () => {
    onSelectClassroom?.(undefined);
    onSelectSubject?.(undefined);
    onSelectAttendance?.("all");
  };

  const tableColumns = useMemo(
    () => [
      columns.accessor(
        (r) => `${r.studentName} ${r.studentEmail} ${r.classroomName}`,
        {
          id: "learner",
          header: "Learner",
          enableHiding: false,
          cell: ({ row }) => {
            const r = row.original;
            const initials = r.studentName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => onSelectReport(r.id)}
              >
                <Avatar className="h-9 w-9 border border-border/60">
                  {r.studentAvatar && (
                    <AvatarImage src={r.studentAvatar} alt={r.studentName} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials || "ST"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {r.studentName}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {r.studentEmail}
                  </span>
                </div>
              </div>
            );
          },
        },
      ),

      columns.accessor((r) => `${r.classroomName} ${r.subjectName}`, {
        id: "classroom",
        header: "Classroom & Subject",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                {r.classroomName}
              </span>
              <Badge
                variant="outline"
                className="w-fit text-[10px] font-normal px-1.5 py-0"
              >
                {r.subjectName}
              </Badge>
            </div>
          );
        },
      }),

      columns.accessor((r) => r.lessonScheduledAt ?? r.createdAt, {
        id: "lessonDate",
        header: "Lesson Date",
        cell: ({ row }) => {
          const dateStr = row.original.lessonScheduledAt ?? row.original.createdAt;
          const dateObj = new Date(dateStr);

          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">
                {dateObj.toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        },
      }),

      columns.accessor((r) => r.teacherName, {
        id: "teacher",
        header: "Teacher",
        cell: ({ row }) => {
          const r = row.original;
          const initials = r.teacherName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-border/60">
                {r.teacherAvatar && (
                  <AvatarImage src={r.teacherAvatar} alt={r.teacherName} />
                )}
                <AvatarFallback className="text-[10px] bg-muted font-medium">
                  {initials || "TR"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-foreground truncate max-w-[130px]">
                {r.teacherName}
              </span>
            </div>
          );
        },
      }),

      columns.accessor((r) => r.status, {
        id: "status",
        header: "Report Status",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-col gap-1">
              <ReportStatusBadge status={r.status} />
              {r.commentsCount > 0 && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="size-3" />
                  {r.commentsCount} {r.commentsCount === 1 ? "note" : "notes"}
                </span>
              )}
            </div>
          );
        },
      }),

      columns.accessor((r) => r.attendanceStatus, {
        id: "attendance",
        header: "Attendance",
        cell: ({ row }) => (
          <ReportAttendanceBadge status={row.original.attendanceStatus} />
        ),
      }),

      columns.accessor((r) => r.overallRating ?? -1, {
        id: "rating",
        header: "Rating & Score",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-2 text-xs">
              {r.overallRating ? (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  {r.overallRating}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
              {r.scorePercent !== null && r.scorePercent !== undefined && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {r.scorePercent}%
                </Badge>
              )}
            </div>
          );
        },
      }),

      columns.accessor((r) => String(r.parentCanView), {
        id: "parentAccess",
        header: "Visibility",
        cell: ({ row }) => {
          const visible = row.original.parentCanView;
          return visible ? (
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[11px] gap-1 font-normal"
            >
              <Eye className="size-3" />
              Shared
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-border/70 bg-muted/40 text-muted-foreground text-[11px] gap-1 font-normal"
            >
              <Lock className="size-3" />
              Staff only
            </Badge>
          );
        },
      }),

      columns.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const r = row.original;
          const needsAction = ["draft", "ai_draft", "teacher_reviewing"].includes(
            r.status,
          );

          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant={needsAction ? "secondary" : "ghost"}
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => onSelectReport(r.id)}
              >
                <span>{needsAction ? "Review" : "View"}</span>
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 text-muted-foreground hover:text-foreground"
                title="Open full workspace"
                onClick={() => navigate(lessonReportRoute(r.id))}
              >
                <Maximize2 className="size-3.5" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [navigate, onSelectReport],
  );

  return (
    <DataTable
      columns={tableColumns}
      data={reports}
      isLoading={isLoading}
      isReloading={isReloading}
      onReload={onReload}
      filterContent={
        <ReportsFilters
          selectedClassroomId={selectedClassroomId}
          onSelectClassroom={onSelectClassroom}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={onSelectSubject}
          selectedAttendance={selectedAttendance}
          onSelectAttendance={onSelectAttendance}
          availableClassrooms={availableClassrooms}
          availableSubjects={availableSubjects}
          isFiltered={isFiltered}
          onResetFilters={onResetFilters}
        />
      }
      isFiltered={isFiltered}
      searchKey="learner"
      searchPlaceholder="Search by learner, classroom, or email..."
      columnLabels={columnLabels}
      emptyIcon={FileText}
      emptyHeading="No lesson reports found"
      emptyDescription="No reports match your current filters, or no lesson reports have been drafted yet."
    />
  );
}

function ReportsFilters({
  selectedClassroomId,
  onSelectClassroom,
  selectedSubjectId,
  onSelectSubject,
  selectedAttendance,
  onSelectAttendance,
  availableClassrooms,
  availableSubjects,
  isFiltered,
  onResetFilters,
}: {
  selectedClassroomId?: string;
  onSelectClassroom?: (classroomId: string | undefined) => void;
  selectedSubjectId?: string;
  onSelectSubject?: (subjectId: string | undefined) => void;
  selectedAttendance?: string;
  onSelectAttendance?: (status: string) => void;
  availableClassrooms: OrgReportsFilterOption[];
  availableSubjects: OrgReportsFilterOption[];
  isFiltered?: boolean;
  onResetFilters?: () => void;
}) {
  return (
    <>
      {isFiltered && (
        <div className="pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="w-full text-xs h-7 text-muted-foreground hover:text-foreground"
          >
            Reset all filters
          </Button>
          <DropdownMenuSeparator />
        </div>
      )}

      {/* Attendance Filter */}
      <DropdownMenuGroup>
        <DropdownMenuLabel>Attendance Status</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={selectedAttendance ?? "all"}
          onValueChange={(val) => onSelectAttendance?.(val)}
        >
          <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="attended">Attended</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="late">Late</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="absent">Absent</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="no_show">No Show</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>

      {availableClassrooms.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Classroom</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={selectedClassroomId ?? "all"}
              onValueChange={(val) =>
                onSelectClassroom?.(val === "all" ? undefined : val)
              }
            >
              <DropdownMenuRadioItem value="all">
                All Classrooms
              </DropdownMenuRadioItem>
              {availableClassrooms.map((c) => (
                <DropdownMenuRadioItem key={c.id} value={c.id}>
                  {c.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </>
      )}

      {availableSubjects.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Subject</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={selectedSubjectId ?? "all"}
              onValueChange={(val) =>
                onSelectSubject?.(val === "all" ? undefined : val)
              }
            >
              <DropdownMenuRadioItem value="all">
                All Subjects
              </DropdownMenuRadioItem>
              {availableSubjects.map((s) => (
                <DropdownMenuRadioItem key={s.id} value={s.id}>
                  {s.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </>
      )}
    </>
  );
}
