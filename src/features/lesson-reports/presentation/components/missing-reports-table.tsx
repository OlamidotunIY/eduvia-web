import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  FilePlus2,
  CheckCircle2,
} from "lucide-react";
import type { MissingReportLessonItem } from "@/shared/domain";
import {
  DataTable,
  type DataTableFeatures,
} from "@/shared/composites/data-table";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";

const columns = createColumnHelper<DataTableFeatures, MissingReportLessonItem>();

const columnLabels = {
  classroom: "Classroom & Subject",
  scheduledAt: "Lesson Date",
  teacher: "Teacher",
  students: "Learners",
  status: "Lesson Status",
  actions: "Action",
};

interface MissingReportsTableProps {
  lessons: MissingReportLessonItem[];
  isLoading?: boolean;
  isReloading?: boolean;
  onReload?: () => void;
  onDraftReport: (lesson: MissingReportLessonItem) => void;
}

export function MissingReportsTable({
  lessons,
  isLoading,
  isReloading,
  onReload,
  onDraftReport,
}: MissingReportsTableProps) {
  const tableColumns = useMemo(
    () => [
      columns.accessor((l) => `${l.classroomName} ${l.subjectName}`, {
        id: "classroom",
        header: "Classroom & Subject",
        enableHiding: false,
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">
                {l.classroomName}
              </span>
              <Badge
                variant="outline"
                className="w-fit text-[10px] font-normal px-1.5 py-0"
              >
                {l.subjectName}
              </Badge>
            </div>
          );
        },
      }),

      columns.accessor((l) => l.scheduledAt, {
        id: "scheduledAt",
        header: "Lesson Date",
        cell: ({ row }) => {
          const l = row.original;
          const dateObj = new Date(l.scheduledAt);
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">
                {dateObj.toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {l.durationMins} mins
              </span>
            </div>
          );
        },
      }),

      columns.accessor((l) => l.teacherName, {
        id: "teacher",
        header: "Teacher",
        cell: ({ row }) => {
          const l = row.original;
          const initials = l.teacherName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 border border-border/60">
                {l.teacherAvatar && (
                  <AvatarImage src={l.teacherAvatar} alt={l.teacherName} />
                )}
                <AvatarFallback className="text-[10px] bg-muted font-medium">
                  {initials || "TR"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-foreground truncate max-w-[140px]">
                {l.teacherName}
              </span>
            </div>
          );
        },
      }),

      columns.accessor(
        (l) =>
          l.students.map((s) => `${s.firstName} ${s.lastName}`).join(", "),
        {
          id: "students",
          header: "Enrolled Learners",
          cell: ({ row }) => {
            const students = row.original.students;
            if (!students || students.length === 0) {
              return (
                <span className="text-xs text-muted-foreground italic">
                  No enrolled learners
                </span>
              );
            }

            return (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {students.slice(0, 3).map((s) => (
                    <Avatar
                      key={s.id}
                      className="h-6 w-6 border-2 border-background"
                    >
                      {s.image && <AvatarImage src={s.image} alt={s.firstName} />}
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                        {`${s.firstName[0] ?? ""}${s.lastName[0] ?? ""}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                  {students.length === 1
                    ? `${students[0].firstName} ${students[0].lastName}`
                    : `${students.length} learners`}
                </span>
              </div>
            );
          },
        },
      ),

      columns.accessor((l) => l.status, {
        id: "status",
        header: "Lesson Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant="outline"
              className="text-[11px] capitalize border-amber-500/30 bg-amber-500/10 text-amber-500"
            >
              {status === "SCHEDULED" ? "Past Due" : status.toLowerCase()}
            </Badge>
          );
        },
      }),

      columns.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div className="flex justify-end">
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => onDraftReport(l)}
                disabled={l.students.length === 0}
              >
                <FilePlus2 className="size-3.5" />
                Draft Report
              </Button>
            </div>
          );
        },
      }),
    ],
    [onDraftReport],
  );

  return (
    <DataTable
      columns={tableColumns}
      data={lessons}
      isLoading={isLoading}
      isReloading={isReloading}
      onReload={onReload}
      searchKey="classroom"
      searchPlaceholder="Search lessons by classroom or subject..."
      columnLabels={columnLabels}
      emptyIcon={CheckCircle2}
      emptyHeading="All caught up!"
      emptyDescription="Every completed past lesson currently has a lesson report drafted or submitted."
    />
  );
}
