import { createColumnHelper } from "@tanstack/react-table";
import { CircleX, Pause, UsersRound } from "lucide-react";
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
        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {subjectNameById.get(getValue()) ?? "Subject unavailable"}
        </span>
      ),
    }),
    columnHelper.accessor((classroom) => classroom.recurrence, {
      id: "schedule",
      header: "Schedule",
      cell: ({ getValue }) => <ScheduleCell recurrence={getValue()} />,
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
      cell: ({ getValue }) => <ClassroomStatusBadge status={getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <IconAction
            label="Manage learners"
            onClick={() => onManageStudents(row.original)}
          >
            <UsersRound />
          </IconAction>
          <IconAction
            label={
              row.original.status.toLowerCase() === "active"
                ? "Pause classroom"
                : "Classroom cannot be paused"
            }
            disabled={
              !canUpdate || row.original.status.toLowerCase() !== "active"
            }
            onClick={() => onPause(row.original)}
          >
            <Pause />
          </IconAction>
          <IconAction
            label={
              row.original.status.toLowerCase() === "closed"
                ? "Classroom is already closed"
                : "Close classroom"
            }
            disabled={
              !canUpdate || row.original.status.toLowerCase() === "closed"
            }
            variant="destructive"
            onClick={() => onClose(row.original)}
          >
            <CircleX />
          </IconAction>
        </div>
      ),
    }),
  ]);
}

function IconAction({
  label,
  disabled = false,
  variant = "ghost",
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size="icon-xs"
      disabled={disabled}
      title={label}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {children}
    </Button>
  );
}

function ScheduleCell({ recurrence }: Pick<Classroom, "recurrence">) {
  const days = recurrence.daysOfWeek.map(formatWeekday).join(", ");
  return (
    <div className="min-w-32">
      <p className="text-xs font-medium">
        {days} · {formatTime(recurrence.startTime)}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">Weekly</p>
    </div>
  );
}

function formatWeekday(dayOfWeek: number): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(Date.UTC(2024, 0, dayOfWeek + 1)),
  );
}

function ClassroomStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const className =
    normalized === "active"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : normalized === "paused"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "border-muted-foreground/20 bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={`capitalize ${className}`}>
      {status}
    </Badge>
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
