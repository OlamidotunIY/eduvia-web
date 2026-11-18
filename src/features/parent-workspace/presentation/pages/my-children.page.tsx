import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  LineChart,
  MoreVertical,
  UserPlus,
  Users,
} from "lucide-react";
import {
  DataTable,
  type DataTableFeatures,
} from "@/shared/composites/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { useParentChildrenQuery } from "../../application/use-parent-workspace";
import { AddChildDialog } from "../components/add-child-dialog";
import type { ParentChildProfile } from "../../domain/parent-workspace.types";

const columnHelper =
  createColumnHelper<DataTableFeatures, ParentChildProfile>();

const columnLabels = {
  learner: "Learner",
  gradeLevel: "Grade Level",
  enrolledSubjects: "Enrolled Subjects",
  performance: "Performance",
  nextLesson: "Next Lesson",
  actions: "Actions",
};

export function MyChildrenPage() {
  const navigate = useNavigate();
  const childrenQuery = useParentChildrenQuery();
  const children = childrenQuery.data ?? [];

  const [isAddChildOpen, setIsAddChildOpen] = useState(false);

  const totalChildren = children.length;
  const avgAttendance =
    totalChildren > 0
      ? Math.round(
          children.reduce((acc, c) => acc + c.attendanceRate, 0) /
            totalChildren,
        )
      : 0;
  const avgMastery =
    totalChildren > 0
      ? Math.round(
          children.reduce((acc, c) => acc + c.masteryPercentage, 0) /
            totalChildren,
        )
      : 0;
  const totalSubjects = new Set(
    children.flatMap((c) => c.enrolledSubjects),
  ).size;

  const columns = useMemo(
    () => [
      columnHelper.accessor("firstName", {
        id: "learner",
        header: "Learner",
        cell: (info) => {
          const row = info.row.original;
          const initials = `${row.firstName?.[0] ?? ""}${
            row.lastName?.[0] ?? ""
          }`.toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9 rounded-full border border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">
                  {row.firstName} {row.lastName}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {row.timezone}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("gradeLevel", {
        id: "gradeLevel",
        header: "Grade Level",
        cell: (info) => (
          <Badge variant="secondary" className="text-xs font-medium">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("enrolledSubjects", {
        id: "enrolledSubjects",
        header: "Enrolled Subjects",
        cell: (info) => {
          const subjects = info.getValue() ?? [];
          return (
            <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
              {subjects.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-foreground"
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                  {sub}
                </span>
              ))}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "performance",
        header: "Mastery & Attendance",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col gap-1 min-w-[9rem]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Mastery</span>
                <span className="font-semibold text-primary font-heading">
                  {row.masteryPercentage}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${row.masteryPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                <span>Attendance</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {row.attendanceRate}%
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("nextLesson", {
        id: "nextLesson",
        header: "Next Lesson",
        cell: (info) => {
          const lesson = info.getValue();
          if (!lesson) {
            return (
              <span className="text-xs text-muted-foreground italic">
                No upcoming session
              </span>
            );
          }
          const scheduled = new Date(lesson.scheduledAt);
          return (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">
                {lesson.subject}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {lesson.teacherName}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                <Clock className="size-3 shrink-0" />
                <span>
                  {scheduled.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {scheduled.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="xs"
                className="h-8 gap-1 text-xs font-medium"
                onClick={() =>
                  navigate(`${APP_ROUTES.CHILDREN_PROGRESS}?childId=${row.id}`)
                }
              >
                <LineChart className="size-3.5" />
                <span>Reports</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-8"
                      aria-label="More actions"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(
                        `${APP_ROUTES.CHILDREN_PROGRESS}?childId=${row.id}`,
                      )
                    }
                    className="cursor-pointer"
                  >
                    <LineChart className="size-4" />
                    <span>View Progress Graph</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate(APP_ROUTES.CALENDAR)}
                    className="cursor-pointer"
                  >
                    <Calendar className="size-4" />
                    <span>View Calendar Schedule</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate(APP_ROUTES.MARKETPLACE)}
                    className="cursor-pointer"
                  >
                    <Compass className="size-4" />
                    <span>Find Tuition</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [navigate],
  );

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Children Directory
          </p>
          <h1 className="mt-1 font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            My Children
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs md:text-sm text-muted-foreground">
            Monitor enrolled learners, academic performance metrics, upcoming
            lessons, and tuition programs for your family.
          </p>
        </div>

        <Button
          className="h-10 rounded-lg px-4 text-xs font-semibold shadow-xs"
          onClick={() => setIsAddChildOpen(true)}
        >
          <UserPlus className="size-4 mr-1.5" />
          <span>Register Child</span>
        </Button>
      </div>

      {/* Aggregate Metrics Bar (Matching Eduvia Metric Cards) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0 rounded-xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Enrolled Children
            </span>
            <Users className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-heading">
            {totalChildren}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Active learner profiles
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Average Mastery Rate
            </span>
            <Award className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-heading">
            {avgMastery}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Across all enrolled subjects
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Session Attendance
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-heading">
            {avgAttendance}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Punctuality in live classes
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Active Subjects
            </span>
            <BookOpen className="size-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-heading">
            {totalSubjects}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            STEM & Humanities curricula
          </p>
        </div>
      </div>

      {/* Children Directory DataTable */}
      <div className="flex flex-col gap-3">
        <DataTable
          columns={columns}
          data={children}
          isLoading={childrenQuery.isLoading}
          columnLabels={columnLabels}
          searchKey="learner"
          searchPlaceholder="Search children by name..."
          onRowClick={(row) =>
            navigate(`${APP_ROUTES.CHILDREN_PROGRESS}?childId=${row.id}`)
          }
          emptyHeading="No children registered"
          emptyDescription="You haven't added any child profiles to your workspace yet. Click Register Child to start."
          emptyIcon={GraduationCap}
          emptyAction={
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setIsAddChildOpen(true)}
            >
              <UserPlus className="size-3.5" />
              <span>Register First Child</span>
            </Button>
          }
        />
      </div>

      {/* Add Child Dialog */}
      <AddChildDialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen} />
    </section>
  );
}
