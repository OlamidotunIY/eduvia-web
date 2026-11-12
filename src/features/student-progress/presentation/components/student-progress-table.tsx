import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type {
  OrgStudentProgressItem,
  MasteryTier,
} from "@/shared/domain";
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

const columns = createColumnHelper<DataTableFeatures, OrgStudentProgressItem>();

const columnLabels = {
  learner: "Learner",
  classrooms: "Classrooms",
  mastery: "Mastery Level",
  topics: "Curriculum Topics",
  attendance: "Lessons & Attendance",
  avgScore: "Avg Score",
  lastLesson: "Last Lesson",
  actions: "Action",
};

interface StudentProgressTableProps {
  students: OrgStudentProgressItem[];
  isLoading?: boolean;
  isReloading?: boolean;
  onReload?: () => void;
  selectedClassroomId?: string;
  onSelectClassroom?: (classroomId: string | undefined) => void;
  selectedSubjectId?: string;
  onSelectSubject?: (subjectId: string | undefined) => void;
  selectedTier?: string;
  onSelectTier?: (tier: string) => void;
  availableClassrooms?: Array<{ id: string; name: string }>;
  availableSubjects?: Array<{ id: string; name: string }>;
}

export function StudentProgressTable({
  students,
  isLoading,
  isReloading,
  onReload,
  selectedClassroomId,
  onSelectClassroom,
  selectedSubjectId,
  onSelectSubject,
  selectedTier = "all",
  onSelectTier,
  availableClassrooms = [],
  availableSubjects = [],
}: StudentProgressTableProps) {
  const navigate = useNavigate();

  const isFiltered =
    Boolean(selectedClassroomId) ||
    Boolean(selectedSubjectId) ||
    selectedTier !== "all";

  const onResetFilters = () => {
    onSelectClassroom?.(undefined);
    onSelectSubject?.(undefined);
    onSelectTier?.("all");
  };

  const tableColumns = useMemo(
    () => [
      columns.accessor(
        (student) => `${student.firstName} ${student.lastName} ${student.email}`,
        {
          id: "learner",
          header: "Learner",
          enableHiding: false,
          cell: ({ row }) => {
            const s = row.original;
            const initials = `${s.firstName[0] ?? ""}${s.lastName[0] ?? ""}`.toUpperCase();

            return (
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate(`/student-progress/${s.studentId}`)}
              >
                <Avatar className="h-9 w-9 border border-border/60">
                  {s.image && <AvatarImage src={s.image} alt={s.firstName} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials || "ST"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {s.firstName} {s.lastName}
                    </span>
                    {s.gradeLevel && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 font-normal"
                      >
                        {s.gradeLevel}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {s.email}
                  </span>
                </div>
              </div>
            );
          },
        },
      ),

      columns.accessor((s) => s.classrooms.map((c) => c.name).join(", "), {
        id: "classrooms",
        header: "Classrooms",
        cell: ({ row }) => {
          const classrooms = row.original.classrooms;
          if (!classrooms || classrooms.length === 0) {
            return (
              <span className="text-xs text-muted-foreground italic">
                Not enrolled
              </span>
            );
          }

          return (
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {classrooms.slice(0, 2).map((c) => (
                <Badge
                  key={c.id}
                  variant="outline"
                  className="text-[11px] font-normal truncate max-w-[130px]"
                  title={c.name}
                >
                  {c.name}
                </Badge>
              ))}
              {classrooms.length > 2 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1 py-0 h-4"
                  title={classrooms.slice(2).map((c) => c.name).join(", ")}
                >
                  +{classrooms.length - 2}
                </Badge>
              )}
            </div>
          );
        },
      }),

      columns.accessor(
        (s) => s.summary.overallMasteryLevel ?? 0,
        {
          id: "mastery",
          header: "Mastery Level",
          cell: ({ row }) => {
            const mastery = row.original.summary.overallMasteryLevel;
            const tier = row.original.summary.masteryTier;

            return (
              <div className="flex flex-col gap-1.5 min-w-[140px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {mastery !== null && mastery !== undefined
                      ? `${mastery}%`
                      : "—"}
                  </span>
                  <MasteryTierBadge tier={tier} />
                </div>
                <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getMasteryBarColor(
                      tier,
                    )}`}
                    style={{
                      width: `${Math.min(100, Math.max(0, mastery ?? 0))}%`,
                    }}
                  />
                </div>
              </div>
            );
          },
        },
      ),

      columns.accessor(
        (s) => s.summary.masteredTopicsCount,
        {
          id: "topics",
          header: "Curriculum Topics",
          cell: ({ row }) => {
            const { masteredTopicsCount, inProgressTopicsCount } =
              row.original.summary;

            return (
              <div className="flex flex-col text-xs gap-0.5">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {masteredTopicsCount} mastered
                </span>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-blue-400" />
                  {inProgressTopicsCount} in progress
                </span>
              </div>
            );
          },
        },
      ),

      columns.accessor(
        (s) => s.summary.totalLessonsAttended,
        {
          id: "attendance",
          header: "Lessons",
          cell: ({ row }) => {
            const { totalLessonsAttended, totalLessonsMissed } =
              row.original.summary;

            return (
              <div className="flex flex-col text-xs gap-0.5">
                <span className="text-foreground font-medium">
                  {totalLessonsAttended} attended
                </span>
                {totalLessonsMissed > 0 ? (
                  <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {totalLessonsMissed} missed
                  </span>
                ) : (
                  <span className="text-muted-foreground text-[11px]">
                    0 missed
                  </span>
                )}
              </div>
            );
          },
        },
      ),

      columns.accessor(
        (s) => s.summary.averageScorePercent ?? -1,
        {
          id: "avgScore",
          header: "Avg Score",
          cell: ({ row }) => {
            const score = row.original.summary.averageScorePercent;
            if (score === null || score === undefined) {
              return <span className="text-xs text-muted-foreground">—</span>;
            }

            const colorClass =
              score >= 80
                ? "text-emerald-500 font-semibold"
                : score >= 65
                  ? "text-foreground font-medium"
                  : "text-amber-500 font-medium";

            return <span className={`text-xs ${colorClass}`}>{score}%</span>;
          },
        },
      ),

      columns.accessor(
        (s) => s.summary.lastLessonAt ?? "",
        {
          id: "lastLesson",
          header: "Last Lesson",
          cell: ({ row }) => {
            const dateStr = row.original.summary.lastLessonAt;
            if (!dateStr) {
              return <span className="text-xs text-muted-foreground">—</span>;
            }

            const formatted = new Date(dateStr).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return <span className="text-xs text-muted-foreground">{formatted}</span>;
          },
        },
      ),

      columns.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() =>
                  navigate(`/student-progress/${row.original.studentId}`)
                }
              >
                <span>Profile</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [navigate],
  );

  return (
    <DataTable
      columns={tableColumns}
      data={students}
      isLoading={isLoading}
      isReloading={isReloading}
      onReload={onReload}
      filterContent={
        <StudentProgressFilters
          selectedClassroomId={selectedClassroomId}
          onSelectClassroom={onSelectClassroom}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={onSelectSubject}
          selectedTier={selectedTier}
          onSelectTier={onSelectTier}
          availableClassrooms={availableClassrooms}
          availableSubjects={availableSubjects}
          isFiltered={isFiltered}
          onResetFilters={onResetFilters}
        />
      }
      isFiltered={isFiltered}
      searchKey="learner"
      searchPlaceholder="Search learners by name or email..."
      columnLabels={columnLabels}
      emptyIcon={GraduationCap}
      emptyHeading="No learners found"
      emptyDescription="No learner records matched your filter criteria or no students are currently enrolled."
    />
  );
}

function StudentProgressFilters({
  selectedClassroomId,
  onSelectClassroom,
  selectedSubjectId,
  onSelectSubject,
  selectedTier,
  onSelectTier,
  availableClassrooms,
  availableSubjects,
  isFiltered,
  onResetFilters,
}: {
  selectedClassroomId?: string;
  onSelectClassroom?: (classroomId: string | undefined) => void;
  selectedSubjectId?: string;
  onSelectSubject?: (subjectId: string | undefined) => void;
  selectedTier?: string;
  onSelectTier?: (tier: string) => void;
  availableClassrooms: Array<{ id: string; name: string }>;
  availableSubjects: Array<{ id: string; name: string }>;
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
      {/* Tier Filter */}
      <DropdownMenuGroup>
        <DropdownMenuLabel>Mastery Tier</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={selectedTier ?? "all"}
          onValueChange={(val) => onSelectTier?.(val)}
        >
          <DropdownMenuRadioItem value="all">All Tiers</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Mastered">Mastered (&ge; 80%)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Proficient">Proficient (65-79%)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="In Progress">In Progress (45-64%)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Needs Support">Needs Support (&lt; 45%)</DropdownMenuRadioItem>
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

function MasteryTierBadge({ tier }: { tier: MasteryTier }) {
  switch (tier) {
    case "Mastered":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] px-1.5 py-0"
        >
          Mastered
        </Badge>
      );
    case "Proficient":
      return (
        <Badge
          variant="outline"
          className="bg-sky-500/10 text-sky-500 border-sky-500/20 text-[10px] px-1.5 py-0"
        >
          Proficient
        </Badge>
      );
    case "In Progress":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] px-1.5 py-0"
        >
          In Progress
        </Badge>
      );
    case "Needs Support":
    default:
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] px-1.5 py-0"
        >
          Needs Support
        </Badge>
      );
  }
}

function getMasteryBarColor(tier: MasteryTier): string {
  switch (tier) {
    case "Mastered":
      return "bg-emerald-500";
    case "Proficient":
      return "bg-sky-500";
    case "In Progress":
      return "bg-blue-500";
    case "Needs Support":
    default:
      return "bg-amber-500";
  }
}
