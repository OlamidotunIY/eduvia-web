import { createColumnHelper } from "@tanstack/react-table";
import { CircleX, Pause, UserPlus } from "lucide-react";
import type { Classroom } from "@/shared/domain";
import type { DataTableFeatures } from "@/shared/composites/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const columnHelper = createColumnHelper<DataTableFeatures, Classroom>();

export const classroomColumnLabels: Record<string, string> = {
  name: "Classroom",
  subject: "Subject",
  schedule: "Schedule",
  duration: "Lesson duration",
  capacity: "Capacity",
  status: "Status",
};

interface ClassroomColumnsOptions {
  subjectNameById: Map<string, string>;
  onManageStudents: (classroom: Classroom) => void;
  onPause: (classroom: Classroom) => void;
  onClose: (classroom: Classroom) => void;
  canUpdate: boolean;
}

export function createClassroomColumns({
  subjectNameById,
  onManageStudents,
  onPause,
  onClose,
  canUpdate,
}: ClassroomColumnsOptions) {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      id: "name",
      header: "Classroom",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex min-w-44 flex-col py-0.5">
          <span className="text-xs font-semibold text-foreground">
            {row.original.name}
          </span>
          <span className="mt-0.5 text-[11px] text-muted-foreground">
            {row.original.primaryTeacherId === ""
              ? "No teacher assigned"
              : "Teacher-led classroom"}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("subjectId", {
      id: "subject",
      header: "Subject",
      cell: ({ getValue }) => (
        <Badge
          variant="secondary"
          className="rounded-md bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          {subjectNameById.get(getValue()) ?? "Subject unavailable"}
        </Badge>
      ),
    }),
    columnHelper.accessor((classroom) => classroom.recurrence, {
      id: "schedule",
      header: "Schedule",
      cell: ({ getValue }) => {
        const recurrence = getValue();
        const days = recurrence.daysOfWeek.map(formatWeekday).join(", ");
        return (
          <div className="min-w-32">
            <p className="text-xs font-semibold text-foreground">
              {days} · {formatTime(recurrence.startTime)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Weekly</p>
          </div>
        );
      },
    }),
    columnHelper.accessor("lessonDurationMins", {
      id: "duration",
      header: "Duration",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()} min</span>
      ),
    }),
    columnHelper.accessor("maxStudents", {
      id: "capacity",
      header: "Capacity",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {getValue() ? `${getValue()} learners` : "Not capped"}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue();
        const normalized = status.toLowerCase();
        const statusClassName =
          normalized === "active"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : normalized === "paused"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "border-muted-foreground/20 bg-muted text-muted-foreground";
        return (
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-0.5 text-[11px] font-medium capitalize ${statusClassName}`}
          >
            {status.toLowerCase()}
          </Badge>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Manage learners"
            aria-label="Manage learners"
            onClick={() => onManageStudents(row.original)}
          >
            <UserPlus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7 text-muted-foreground hover:text-foreground"
            disabled={
              !canUpdate || row.original.status.toLowerCase() !== "active"
            }
            title={
              row.original.status.toLowerCase() === "active"
                ? "Pause classroom"
                : "Classroom cannot be paused"
            }
            aria-label={
              row.original.status.toLowerCase() === "active"
                ? "Pause classroom"
                : "Classroom cannot be paused"
            }
            onClick={() => onPause(row.original)}
          >
            <Pause className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={
              !canUpdate || row.original.status.toLowerCase() === "closed"
            }
            title={
              row.original.status.toLowerCase() === "closed"
                ? "Classroom is already closed"
                : "Close classroom"
            }
            aria-label={
              row.original.status.toLowerCase() === "closed"
                ? "Classroom is already closed"
                : "Close classroom"
            }
            onClick={() => onClose(row.original)}
          >
            <CircleX className="size-4" />
          </Button>
        </div>
      ),
    }),
  ]);
}

function formatWeekday(dayOfWeek: number): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(Date.UTC(2024, 0, dayOfWeek + 1)),
  );
}

function formatTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2024, 0, 1, hours, minutes));
}
