import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { ClipboardCheck } from "lucide-react";
import type { AssessmentRecord, AssessmentStatus } from "@/shared/domain";
import {
  DataTable,
  type DataTableFeatures,
} from "@/shared/composites/data-table";
import { Badge } from "@/shared/ui/badge";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";

const columns = createColumnHelper<DataTableFeatures, AssessmentRecord>();

const columnLabels = {
  learner: "Learner",
  classroom: "Classroom",
  score: "Score",
  marking: "Marking",
  status: "Status",
  submitted: "Submitted",
};

interface AssessmentsTableProps {
  assessments: AssessmentRecord[];
  isLoading?: boolean;
  isReloading?: boolean;
  onReload?: () => void;
}

export function AssessmentsTable({
  assessments,
  isLoading,
  isReloading,
  onReload,
}: AssessmentsTableProps) {
  const [status, setStatus] = useState<AssessmentStatus | "all">("all");
  const rows = useMemo(
    () =>
      status === "all"
        ? assessments
        : assessments.filter((assessment) => assessment.status === status),
    [assessments, status],
  );

  return (
    <DataTable
      columns={assessmentColumns}
      data={rows}
      isLoading={isLoading}
      isReloading={isReloading}
      onReload={onReload}
      filterContent={<AssessmentStatusFilter status={status} onChange={setStatus} />}
      isFiltered={status !== "all"}
      searchKey="learner"
      searchPlaceholder="Search learners..."
      columnLabels={columnLabels}
      emptyIcon={ClipboardCheck}
      emptyHeading="No assessments yet"
      emptyDescription="Completed classwork and submitted assignments will appear here for review and marking."
    />
  );
}

const assessmentColumns = columns.columns([
  columns.accessor((assessment) => assessment.learner?.fullName ?? "Unknown learner", {
    id: "learner",
    header: "Learner",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex min-w-40 flex-col">
        <span className="text-xs font-semibold">{row.original.learner?.fullName ?? "Unknown learner"}</span>
        <span className="mt-0.5 text-[11px] text-muted-foreground">
          {row.original.learner?.email ?? "Learner details unavailable"}
        </span>
      </div>
    ),
  }),
  columns.accessor((assessment) => assessment.lesson?.classroomName ?? "—", {
    id: "classroom",
    header: "Classroom",
    cell: ({ row }) => (
      <div className="flex min-w-36 flex-col text-xs">
        <span className="font-medium">{row.original.lesson?.classroomName ?? "Classroom unavailable"}</span>
        <span className="mt-0.5 text-[11px] text-muted-foreground">
          {row.original.lesson ? formatDate(row.original.lesson.scheduledAt) : "—"}
        </span>
      </div>
    ),
  }),
  columns.accessor("scorePercent", {
    id: "score",
    header: "Score",
    cell: ({ row }) => {
      const { scorePercent, totalMarksAwarded, totalMaxMarks } = row.original;
      return scorePercent === null ? (
        <span className="text-xs text-muted-foreground">Awaiting marks</span>
      ) : (
        <div className="flex flex-col text-xs">
          <span className="font-semibold">{Math.round(scorePercent)}%</span>
          <span className="mt-0.5 text-[11px] text-muted-foreground">
            {totalMarksAwarded ?? 0}/{totalMaxMarks} marks
          </span>
        </div>
      );
    },
  }),
  columns.accessor("pendingMarkCount", {
    id: "marking",
    header: "Marking",
    cell: ({ row }) => {
      const { pendingMarkCount, autoMarkedCount, teacherMarkedCount } = row.original;
      return (
        <span className="text-xs text-muted-foreground">
          {pendingMarkCount > 0
            ? `${pendingMarkCount} pending`
            : `${autoMarkedCount + teacherMarkedCount} marked`}
        </span>
      );
    },
  }),
  columns.accessor("status", {
    id: "status",
    header: "Status",
    cell: ({ getValue }) => <AssessmentStatusBadge status={getValue()} />,
  }),
  columns.accessor("createdAt", {
    id: "submitted",
    header: "Submitted",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">{formatDate(getValue())}</span>
    ),
  }),
]);

function AssessmentStatusBadge({ status }: { status: AssessmentStatus }) {
  const config = {
    pending_marking: ["Pending marking", "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"],
    partially_marked: ["Partially marked", "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400"],
    fully_marked: ["Marked", "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"],
  } as const;
  const [label, className] = config[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

function AssessmentStatusFilter({
  status,
  onChange,
}: {
  status: AssessmentStatus | "all";
  onChange: (status: AssessmentStatus | "all") => void;
}) {
  return (
    <div className="space-y-3">
      <DropdownMenuGroup>
        <DropdownMenuLabel>Assessment status</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={(value) => onChange(value as AssessmentStatus | "all")}>
          <DropdownMenuRadioItem value="all">All assessments</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="pending_marking">Pending marking</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="partially_marked">Partially marked</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="fully_marked">Marked</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>
      {status !== "all" ? (
        <>
          <DropdownMenuSeparator />
          <button type="button" className="w-full rounded-sm px-2 py-1.5 text-left text-xs font-medium text-destructive hover:bg-destructive/10" onClick={() => onChange("all")}>
            Clear filter
          </button>
        </>
      ) : null}
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
