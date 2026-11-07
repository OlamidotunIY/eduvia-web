import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Clock3,
  ExternalLink,
  Eye,
  Globe,
  GraduationCap,
  History,
  Info,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Power,
  RefreshCw,
  Repeat,
  RotateCcw,
  Search,
  Settings,
  Settings2,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { sessionStore } from "@/shared/store";
import {
  useAddLearnerMutation,
  useClassroomDetailQuery,
  useClassroomLessonsQuery,
  useClassroomStudentsQuery,
  useCloseClassroomMutation,
  useLearnerCandidatesQuery,
  useOrganizationSubjectsQuery,
  usePauseClassroomMutation,
  useRescheduleLessonMutation,
  useScheduleLessonMutation,
} from "../../application";
import {
  AddLearnerDialog,
  ScheduleLessonDialog,
} from "../components/classroom-action-dialogs";

type DetailTab = "overview" | "learners" | "lessons" | "settings";
type SettingsSection = "general" | "schedule" | "enrollment" | "lifecycle";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ClassroomDetailPage() {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const [tab, setTab] = useState<DetailTab>("overview");
  const [settingsSection, setSettingsSection] =
    useState<SettingsSection>("general");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isLearnerOpen, setIsLearnerOpen] = useState(false);

  // Overview schedule pagination
  const [schedulePage, setSchedulePage] = useState(0);

  // Lessons tab filters & pagination
  const [lessonSearch, setLessonSearch] = useState("");
  const [lessonStatusFilter, setLessonStatusFilter] = useState("all");
  const [lessonDateFilter, setLessonDateFilter] = useState("all");
  const [lessonsPage, setLessonsPage] = useState(0);

  // Learners tab filters & pagination
  const [learnerSearch, setLearnerSearch] = useState("");
  const [learnerStatusFilter, setLearnerStatusFilter] = useState("all");
  const [learnersPage, setLearnersPage] = useState(0);

  // Settings form state
  const [settingsName, setSettingsName] = useState("");
  const [settingsSubjectId, setSettingsSubjectId] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsMaxStudents, setSettingsMaxStudents] = useState("10");
  const [settingsDurationMins, setSettingsDurationMins] = useState("60");
  const [settingsStartTime, setSettingsStartTime] = useState("09:00");

  const [reschedulingLesson, setReschedulingLesson] = useState<{
    id: string;
    scheduledAt: string;
    durationMins: number;
  } | null>(null);

  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const classroom = useClassroomDetailQuery(organizationId, classroomId);
  const students = useClassroomStudentsQuery(organizationId, classroomId);
  const lessons = useClassroomLessonsQuery(organizationId, classroomId);
  const subjects = useOrganizationSubjectsQuery(organizationId);
  const learnerCandidates = useLearnerCandidatesQuery(
    organizationId,
    classroomId,
  );
  const scheduleLesson = useScheduleLessonMutation(organizationId, classroomId);
  const rescheduleLesson = useRescheduleLessonMutation(
    organizationId,
    classroomId,
  );
  const addLearner = useAddLearnerMutation(organizationId, classroomId);
  const pauseClassroom = usePauseClassroomMutation(organizationId);
  const closeClassroom = useCloseClassroomMutation(organizationId);

  const subjectName = useMemo(
    () =>
      subjects.data?.find((subject) => subject.id === classroom.data?.subjectId)
        ?.name ?? "Subject",
    [classroom.data?.subjectId, subjects.data],
  );

  useEffect(() => {
    if (!classroom.data) return;
    setSettingsName(classroom.data.name);
    setSettingsSubjectId(classroom.data.subjectId);
    setSettingsDescription(
      `${classroom.data.name} class covering core concepts, practice, and problem solving.`,
    );
    setSettingsMaxStudents(String(classroom.data.maxStudents ?? 10));
    setSettingsDurationMins(String(classroom.data.lessonDurationMins));
    setSettingsStartTime(classroom.data.recurrence.startTime);
  }, [classroom.data]);

  if (classroom.isPending) {
    return (
      <section className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-56 lg:col-span-2" />
          <Skeleton className="h-56" />
        </div>
      </section>
    );
  }

  if (!classroom.data) {
    return (
      <section className="mx-auto flex max-w-xl flex-1 flex-col items-start py-16">
        <p className="text-sm font-medium text-primary">Classroom</p>
        <h1 className="mt-2 font-sans text-3xl font-bold">
          Classroom unavailable
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This classroom could not be loaded. It may have been removed or you
          may no longer have access to it.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => navigate(APP_ROUTES.CLASSROOMS)}
        >
          <ArrowLeft /> Back to classrooms
        </Button>
      </section>
    );
  }

  const canUpdate = permissions.includes("classrooms:update");
  const canManageLearners = permissions.includes("classrooms:manage_students");
  const canScheduleLessons = permissions.includes("lessons:schedule");
  const canManageLessons = permissions.includes("lessons:manage");

  const daysLabel = classroom.data.recurrence.daysOfWeek
    .map((day) => dayNames[day])
    .join(" & ");
  const formattedStartTime = formatClockTime(
    classroom.data.recurrence.startTime,
  );
  const schedule = `${daysLabel} · ${formattedStartTime}`;

  const teacherName =
    classroom.data.primaryTeacherId &&
    currentUser?.user &&
    classroom.data.primaryTeacherId === currentUser.user.id
      ? `${currentUser.user.firstName} ${currentUser.user.lastName}`.trim()
      : currentUser?.user
        ? `${currentUser.user.firstName} ${currentUser.user.lastName}`.trim() ||
          "Teacher-led"
        : "Teacher-led";

  const allStudents = students.data ?? [];
  const activeLearners = allStudents.filter(
    (student) => student.status === "active",
  );
  const allLessons = lessons.data ?? [];
  const now = Date.now();
  const upcomingLessons = allLessons.filter(
    (lesson) => new Date(lesson.scheduledAt).getTime() >= now,
  );
  const recentLessons = allLessons.filter(
    (lesson) => new Date(lesson.scheduledAt).getTime() < now,
  );

  // Overview schedule pagination
  const pageSize = 8;
  const totalSchedulePages = Math.max(
    1,
    Math.ceil(allLessons.length / pageSize),
  );
  const currentSchedulePage = Math.min(schedulePage, totalSchedulePages - 1);
  const paginatedLessons = allLessons.slice(
    currentSchedulePage * pageSize,
    (currentSchedulePage + 1) * pageSize,
  );

  // Lessons tab filtering & pagination
  const filteredTabLessons = allLessons.filter((lesson) => {
    if (
      lessonStatusFilter !== "all" &&
      lesson.status.toLowerCase() !== lessonStatusFilter
    ) {
      return false;
    }
    if (
      lessonDateFilter === "upcoming" &&
      new Date(lesson.scheduledAt).getTime() < now
    ) {
      return false;
    }
    if (
      lessonDateFilter === "past" &&
      new Date(lesson.scheduledAt).getTime() >= now
    ) {
      return false;
    }
    if (lessonSearch.trim()) {
      const q = lessonSearch.trim().toLowerCase();
      const dateStr =
        `${formatShortDate(lesson.scheduledAt)} ${formatFullWeekday(lesson.scheduledAt)} ${formatDateTimeClock(lesson.scheduledAt)} ${teacherName} ${lesson.status}`.toLowerCase();
      if (!dateStr.includes(q)) return false;
    }
    return true;
  });
  const totalLessonsTabPages = Math.max(
    1,
    Math.ceil(filteredTabLessons.length / pageSize),
  );
  const currentLessonsTabPage = Math.min(lessonsPage, totalLessonsTabPages - 1);
  const paginatedTabLessons = filteredTabLessons.slice(
    currentLessonsTabPage * pageSize,
    (currentLessonsTabPage + 1) * pageSize,
  );

  // Learners tab filtering & pagination
  const filteredTabLearners = allStudents.filter((student) => {
    if (
      learnerStatusFilter !== "all" &&
      student.status.toLowerCase() !== learnerStatusFilter
    ) {
      return false;
    }
    if (learnerSearch.trim()) {
      const q = learnerSearch.trim().toLowerCase();
      const fullName = student.learner
        ? `${student.learner.firstName} ${student.learner.lastName}`.toLowerCase()
        : "";
      const email = (student.learner?.email ?? student.studentId).toLowerCase();
      if (!fullName.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });
  const totalLearnersTabPages = Math.max(
    1,
    Math.ceil(filteredTabLearners.length / pageSize),
  );
  const currentLearnersTabPage = Math.min(
    learnersPage,
    totalLearnersTabPages - 1,
  );
  const paginatedTabLearners = filteredTabLearners.slice(
    currentLearnersTabPage * pageSize,
    (currentLearnersTabPage + 1) * pageSize,
  );

  const normalizedStatus = classroom.data.status.toLowerCase();
  const classroomStatusBadgeClass =
    normalizedStatus === "active"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : normalizedStatus === "paused"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "border-muted-foreground/20 bg-muted text-muted-foreground";

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col gap-5">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2.5 h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => navigate(APP_ROUTES.CLASSROOMS)}
        >
          <ArrowLeft className="size-3.5" /> All classrooms
        </Button>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">
                {classroom.data.name}
              </h1>
              <Badge
                variant="outline"
                className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize ${classroomStatusBadgeClass}`}
              >
                {classroom.data.status.toLowerCase()}
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {subjectName} ·{" "}
              {classroom.data.primaryTeacherId === ""
                ? "No teacher assigned"
                : "Teacher-led classroom"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9 gap-2 rounded-lg px-3.5 text-xs font-medium"
              disabled={!canUpdate}
              title={
                canUpdate
                  ? undefined
                  : "You need classroom update permission to edit this classroom."
              }
              onClick={() => {
                setTab("settings");
                setSettingsSection("general");
              }}
            >
              <Pencil className="size-3.5" /> Edit classroom
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-lg"
                    aria-label="Classroom actions"
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  disabled={!canUpdate}
                  onClick={() => {
                    setTab("settings");
                    setSettingsSection("general");
                  }}
                >
                  <Pencil /> Edit classroom
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!canUpdate}
                  onClick={() => {
                    setTab("settings");
                    setSettingsSection("lifecycle");
                  }}
                >
                  <Settings2 /> Pause or close
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-card/60 py-0 shadow-none">
          <CardContent className="flex flex-row items-center gap-3.5 px-4 py-3.5">
            <UserRound className="size-6 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Teacher</p>
              <p className="mt-0.5 truncate font-sans text-base font-bold text-foreground">
                {teacherName}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 py-0 shadow-none">
          <CardContent className="flex flex-row items-center gap-3.5 px-4 py-3.5">
            <Users className="size-6 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Learners</p>
              <p className="mt-0.5 truncate font-sans text-base font-bold text-foreground">
                {activeLearners.length}
                {classroom.data.maxStudents
                  ? ` / ${classroom.data.maxStudents}`
                  : ""}{" "}
                enrolled
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 py-0 shadow-none">
          <CardContent className="flex flex-row items-center gap-3.5 px-4 py-3.5">
            <CalendarDays className="size-6 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Weekly schedule</p>
              <p className="mt-0.5 truncate font-sans text-base font-bold text-foreground">
                {schedule}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 py-0 shadow-none">
          <CardContent className="flex flex-row items-center gap-3.5 px-4 py-3.5">
            <Clock3 className="size-6 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="mt-0.5 truncate font-sans text-base font-bold text-foreground">
                {classroom.data.lessonDurationMins} minutes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as DetailTab)}
        className="gap-4"
      >
        <TabsList
          variant="line"
          aria-label="Classroom sections"
          className="h-auto w-full justify-start gap-2 rounded-none border-b border-border bg-transparent p-0 pb-2"
        >
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="overview"
          >
            <BookOpen className="size-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="lessons"
          >
            <Play className="size-3.5" /> Lessons
          </TabsTrigger>
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="learners"
          >
            <Users className="size-3.5" /> Learners
          </TabsTrigger>
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="settings"
          >
            <Settings className="size-3.5" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,1fr)]">
            <Card
              size="sm"
              className="h-full gap-3 bg-card/60 py-4 shadow-none"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <CardTitle className="font-sans text-base font-bold">
                      Upcoming lessons
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      Next scheduled lesson for this classroom.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {upcomingLessons.length ? (
                  <div className="divide-y divide-border/70 rounded-xl border border-border/70 bg-background/40">
                    {upcomingLessons.slice(0, 2).map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="flex items-center gap-3.5">
                          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {formatLongDate(lesson.scheduledAt)} ·{" "}
                              {formatDateTimeClock(lesson.scheduledAt)}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {subjectName} lesson
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={`rounded-full px-3 py-0.5 text-[11px] font-medium capitalize ${getLessonStatusClass(lesson.status)}`}
                          >
                            {lesson.status.toLowerCase()}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                            onClick={() => setTab("lessons")}
                          >
                            View lesson
                            <ExternalLink className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty className="min-h-32 flex-1 border-0 bg-transparent px-4 py-4">
                    <EmptyHeader className="gap-1">
                      <EmptyMedia variant="icon" className="mb-1 size-9">
                        <CalendarDays className="size-4" />
                      </EmptyMedia>
                      <EmptyTitle className="text-base">
                        No upcoming lessons yet
                      </EmptyTitle>
                      <EmptyDescription className="max-w-xs text-xs">
                        Scheduled lessons will be shown here as soon as they
                        are available.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="mt-0">
                      <Button
                        size="sm"
                        disabled={!canScheduleLessons}
                        onClick={() => setIsScheduleOpen(true)}
                      >
                        <CalendarClock /> Schedule lesson
                      </Button>
                    </EmptyContent>
                  </Empty>
                )}
              </CardContent>
            </Card>

            <Card
              size="sm"
              className="h-full gap-3 bg-card/60 py-4 shadow-none"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <CardTitle className="font-sans text-base font-bold">
                      Classroom information
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      Key details about this classroom.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 justify-between gap-3">
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="flex items-center gap-2.5 text-muted-foreground">
                    <BookOpen className="size-4" /> Subject
                  </span>
                  <span className="text-right font-medium text-foreground">
                    {subjectName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="flex items-center gap-2.5 text-muted-foreground">
                    <Repeat className="size-4" /> Recurrence
                  </span>
                  <span className="text-right font-medium text-foreground">
                    Weekly ({daysLabel})
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="flex items-center gap-2.5 text-muted-foreground">
                    <Globe className="size-4" /> Timezone
                  </span>
                  <span className="text-right font-medium text-foreground">
                    {formatTimezoneDisplay(classroom.data.recurrence.timezone)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="flex items-center gap-2.5 text-muted-foreground">
                    <Clock3 className="size-4" /> Duration
                  </span>
                  <span className="text-right font-medium text-foreground">
                    {classroom.data.lessonDurationMins} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="flex items-center gap-2.5 text-muted-foreground">
                    <Users className="size-4" /> Capacity
                  </span>
                  <span className="text-right font-medium text-foreground">
                    {classroom.data.maxStudents
                      ? `${classroom.data.maxStudents} learners`
                      : `${activeLearners.length} learners`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="flex items-center gap-2.5 text-muted-foreground">
                    <GraduationCap className="size-4" /> Primary teacher
                  </span>
                  <span className="text-right font-medium text-foreground">
                    {teacherName}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card
              size="sm"
              className="h-full gap-3 bg-card/60 py-4 shadow-none"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <History className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <CardTitle className="font-sans text-base font-bold">
                      Recent lessons
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      Recently held lessons and their status.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {recentLessons.length ? (
                  <div className="divide-y divide-border/70 rounded-xl border border-border/70 bg-background/40">
                    {recentLessons.slice(0, 3).map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="flex items-center gap-3.5">
                          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {formatLongDate(lesson.scheduledAt)} ·{" "}
                              {formatDateTimeClock(lesson.scheduledAt)}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {subjectName} lesson
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={`rounded-full px-3 py-0.5 text-[11px] font-medium capitalize ${getLessonStatusClass(lesson.status)}`}
                          >
                            {lesson.status.toLowerCase()}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                            onClick={() => setTab("lessons")}
                          >
                            View lesson
                            <ExternalLink className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty className="min-h-32 flex-1 border-0 bg-transparent px-4 py-4">
                    <EmptyHeader className="gap-1">
                      <EmptyMedia variant="icon" className="mb-1 size-9">
                        <History className="size-4" />
                      </EmptyMedia>
                      <EmptyTitle className="text-base">
                        No recent lessons yet
                      </EmptyTitle>
                      <EmptyDescription className="max-w-xs text-xs">
                        Recently held lessons will be shown here as soon as
                        they are available.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </Card>

            <Card
              size="sm"
              className="h-full gap-3 bg-card/60 py-4 shadow-none"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <CardTitle className="font-sans text-base font-bold">
                      Learners
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      Enrolled learners in this classroom.
                    </CardDescription>
                  </div>
                </div>
                <CardAction>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                    disabled={!canManageLearners}
                    onClick={() => setIsLearnerOpen(true)}
                  >
                    Manage learners
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex-1">
                {activeLearners.length ? (
                  <div className="divide-y divide-border/70 rounded-xl border border-border/70 bg-background/40">
                    {activeLearners.slice(0, 3).map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar size="lg" className="bg-primary/15">
                            <AvatarImage
                              src={student.learner?.image ?? undefined}
                            />
                            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                              {initials(student.learner)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">
                              {student.learner
                                ? `${student.learner.firstName} ${student.learner.lastName}`
                                : "Learner profile"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Learner
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="size-8 text-muted-foreground hover:text-foreground"
                                aria-label="Learner actions"
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => setTab("learners")}
                            >
                              <Users /> View learners
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty className="min-h-32 flex-1 border-0 bg-transparent px-4 py-4">
                    <EmptyHeader className="gap-1">
                      <EmptyMedia variant="icon" className="mb-1 size-9">
                        <Users className="size-4" />
                      </EmptyMedia>
                      <EmptyTitle className="text-base">
                        No learners enrolled
                      </EmptyTitle>
                      <EmptyDescription className="max-w-xs text-xs">
                        Add learners when you are ready to build this
                        classroom roster.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!canManageLearners}
                        onClick={() => setIsLearnerOpen(true)}
                      >
                        Add learner
                      </Button>
                    </EmptyContent>
                  </Empty>
                )}
              </CardContent>
            </Card>

            <Card
              size="sm"
              className="gap-3 bg-card/60 py-4 shadow-none xl:col-span-2"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <CardTitle className="font-sans text-base font-bold">
                      Lesson schedule
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      All scheduled sessions for this classroom.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="gap-2">
                <div className="border-b border-border/80">
                  <Table>
                    <TableHeader className="[&_th]:px-4 [&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg [&_tr]:border-0 [&_tr]:bg-muted/50 [&_tr]:hover:bg-muted/50">
                      <TableRow className="hover:bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="[&_td]:px-4 [&_td]:py-3 [&_tr]:hover:bg-transparent">
                      {paginatedLessons.length ? (
                        paginatedLessons.map((lesson) => (
                          <TableRow
                            key={lesson.id}
                            className="hover:bg-transparent"
                          >
                            <TableCell className="text-xs font-medium text-foreground">
                              {formatShortDate(lesson.scheduledAt)} ·{" "}
                              {formatDateTimeClock(lesson.scheduledAt)}
                            </TableCell>
                            <TableCell className="text-xs text-foreground">
                              {subjectName} lesson
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="rounded-md bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                              >
                                {lesson.origin === "ONE_OFF"
                                  ? "Extra lesson"
                                  : "Lesson"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {lesson.durationMins} min
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`rounded-full px-3 py-0.5 text-[11px] font-medium capitalize ${getLessonStatusClass(lesson.status)}`}
                              >
                                {lesson.status.toLowerCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="size-7 text-muted-foreground hover:text-foreground"
                                  title="View lesson"
                                  aria-label="View lesson"
                                  onClick={() => setTab("lessons")}
                                >
                                  <Eye className="size-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  disabled={!canManageLessons}
                                  title="Reschedule lesson"
                                  aria-label="Reschedule lesson"
                                  onClick={() => setReschedulingLesson(lesson)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={6}>
                            <Empty className="min-h-32 flex-none border-0 bg-transparent px-4 py-5">
                              <EmptyHeader className="gap-1">
                                <EmptyMedia
                                  variant="icon"
                                  className="mb-1 size-9"
                                >
                                  <CalendarDays className="size-4" />
                                </EmptyMedia>
                                <EmptyTitle className="text-base">
                                  No scheduled lessons
                                </EmptyTitle>
                                <EmptyDescription className="max-w-xs text-xs">
                                  The weekly classroom schedule will appear here
                                  once lessons are available.
                                </EmptyDescription>
                              </EmptyHeader>
                              <EmptyContent className="mt-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!canScheduleLessons}
                                  onClick={() => setIsScheduleOpen(true)}
                                >
                                  Schedule lesson
                                </Button>
                              </EmptyContent>
                            </Empty>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between px-2 pt-2 text-xs">
                  <span className="flex-1 text-muted-foreground">
                    {allLessons.length} total item(s)
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      Page {currentSchedulePage + 1} of {totalSchedulePages}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setSchedulePage(0)}
                        disabled={currentSchedulePage === 0}
                        aria-label="First page"
                      >
                        <ChevronsLeft />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setSchedulePage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={currentSchedulePage === 0}
                        aria-label="Previous page"
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setSchedulePage((prev) =>
                            Math.min(totalSchedulePages - 1, prev + 1),
                          )
                        }
                        disabled={currentSchedulePage >= totalSchedulePages - 1}
                        aria-label="Next page"
                      >
                        <ChevronRight />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setSchedulePage(totalSchedulePages - 1)
                        }
                        disabled={currentSchedulePage >= totalSchedulePages - 1}
                        aria-label="Last page"
                      >
                        <ChevronsRight />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lessons">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
                Lessons{" "}
                <span className="text-lg font-normal text-muted-foreground">
                  ({allLessons.length})
                </span>
              </h2>
              <Button
                className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold"
                disabled={!canScheduleLessons}
                onClick={() => setIsScheduleOpen(true)}
              >
                <Plus className="size-4" /> Schedule lesson
              </Button>
            </div>

            <Alert className="items-center rounded-lg border-border/80 bg-card/40 py-2.5 text-muted-foreground">
              <Info className="size-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground">
                Lessons follow your classroom schedule. Schedule additional
                sessions whenever needed.
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-64 max-w-xs">
                  <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-9 rounded-lg pl-8 text-xs"
                    placeholder="Search lessons..."
                    value={lessonSearch}
                    onChange={(event) => {
                      setLessonSearch(event.target.value);
                      setLessonsPage(0);
                    }}
                  />
                </div>

                <Select
                  value={lessonStatusFilter}
                  onValueChange={(value) => {
                    setLessonStatusFilter(value ?? "all");
                    setLessonsPage(0);
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="h-9 min-w-32 rounded-lg text-xs"
                  >
                    <SelectValue>
                      {lessonStatusFilter === "all"
                        ? "All statuses"
                        : lessonStatusFilter.charAt(0).toUpperCase() +
                          lessonStatusFilter.slice(1)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={lessonDateFilter}
                  onValueChange={(value) => {
                    setLessonDateFilter(value ?? "all");
                    setLessonsPage(0);
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="h-9 min-w-44 rounded-lg text-xs [&_svg:last-child]:hidden"
                  >
                    <span className="flex flex-1 items-center gap-2 text-left">
                      <CalendarDays className="size-3.5 text-muted-foreground" />
                      <span>
                        {lessonDateFilter === "all"
                          ? "Select date range"
                          : lessonDateFilter === "upcoming"
                            ? "Upcoming lessons"
                            : "Past lessons"}
                      </span>
                    </span>
                    <ChevronsUpDown className="ml-2 size-3.5 text-muted-foreground" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select date range</SelectItem>
                    <SelectItem value="upcoming">Upcoming lessons</SelectItem>
                    <SelectItem value="past">Past lessons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-lg px-3.5 text-xs font-medium"
                disabled={lessons.isFetching}
                onClick={() => void lessons.refetch()}
              >
                <RefreshCw
                  className={
                    lessons.isFetching ? "size-3.5 animate-spin" : "size-3.5"
                  }
                />
                Refresh
              </Button>
            </div>

            <div className="border-b border-border/80">
              <Table>
                <TableHeader className="[&_th]:px-4 [&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg [&_tr]:border-0 [&_tr]:bg-muted/50 [&_tr]:hover:bg-muted/50">
                  <TableRow className="hover:bg-muted/50">
                    <TableHead>Date &amp; time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_td]:px-4 [&_td]:py-3 [&_tr]:hover:bg-transparent">
                  {paginatedTabLessons.length ? (
                    paginatedTabLessons.map((lesson) => (
                      <TableRow
                        key={lesson.id}
                        className="hover:bg-transparent"
                      >
                        <TableCell>
                          <div className="flex flex-col py-0.5">
                            <span className="text-xs font-bold text-foreground">
                              {formatShortDate(lesson.scheduledAt)} ·{" "}
                              {formatDateTimeClock(lesson.scheduledAt)}
                            </span>
                            <span className="mt-0.5 text-[11px] text-muted-foreground">
                              {formatFullWeekday(lesson.scheduledAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {lesson.durationMins} min
                        </TableCell>
                        <TableCell className="text-xs text-foreground">
                          {teacherName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`rounded-full px-3 py-0.5 text-[11px] font-medium capitalize ${getLessonStatusClass(lesson.status)}`}
                          >
                            {lesson.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              className="size-7 text-muted-foreground hover:text-foreground"
                              title="View lesson"
                              aria-label="View lesson"
                              onClick={() => setReschedulingLesson(lesson)}
                            >
                              <Eye className="size-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    className="size-7 text-muted-foreground hover:text-foreground"
                                    aria-label="Lesson actions"
                                  />
                                }
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  disabled={!canManageLessons}
                                  onClick={() => setReschedulingLesson(lesson)}
                                >
                                  <RotateCcw /> Reschedule lesson
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5}>
                        <Empty className="min-h-40 flex-none border-0 bg-transparent px-4 py-6">
                          <EmptyHeader className="gap-1">
                            <EmptyMedia
                              variant="icon"
                              className="mb-1 size-9"
                            >
                              <CalendarDays className="size-4" />
                            </EmptyMedia>
                            <EmptyTitle className="text-base">
                              No lessons found
                            </EmptyTitle>
                            <EmptyDescription className="max-w-xs text-xs">
                              Scheduled lessons matching your filters will
                              appear here.
                            </EmptyDescription>
                          </EmptyHeader>
                          <EmptyContent className="mt-0">
                            <Button
                              size="sm"
                              disabled={!canScheduleLessons}
                              onClick={() => setIsScheduleOpen(true)}
                            >
                              <Plus className="size-3.5" /> Schedule lesson
                            </Button>
                          </EmptyContent>
                        </Empty>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between px-2 pt-1 text-xs">
              <span className="flex-1 text-muted-foreground">
                {filteredTabLessons.length} total item(s)
              </span>
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  Page {currentLessonsTabPage + 1} of {totalLessonsTabPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setLessonsPage(0)}
                    disabled={currentLessonsTabPage === 0}
                    aria-label="First page"
                  >
                    <ChevronsLeft />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      setLessonsPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentLessonsTabPage === 0}
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      setLessonsPage((prev) =>
                        Math.min(totalLessonsTabPages - 1, prev + 1),
                      )
                    }
                    disabled={
                      currentLessonsTabPage >= totalLessonsTabPages - 1
                    }
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setLessonsPage(totalLessonsTabPages - 1)}
                    disabled={
                      currentLessonsTabPage >= totalLessonsTabPages - 1
                    }
                    aria-label="Last page"
                  >
                    <ChevronsRight />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="learners">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
                  Learners{" "}
                  <span className="text-lg font-normal text-muted-foreground">
                    ({allStudents.length})
                  </span>
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Manage learners enrolled in this classroom.
                </p>
              </div>
              <Button
                className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold"
                disabled={!canManageLearners}
                onClick={() => setIsLearnerOpen(true)}
              >
                <Plus className="size-4" /> Enroll learners
              </Button>
            </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-64 max-w-xs">
                  <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-9 rounded-lg pl-8 text-xs"
                    placeholder="Search learners..."
                    value={learnerSearch}
                    onChange={(event) => {
                      setLearnerSearch(event.target.value);
                      setLearnersPage(0);
                    }}
                  />
                </div>

                <Select
                  value={learnerStatusFilter}
                  onValueChange={(value) => {
                    setLearnerStatusFilter(value ?? "all");
                    setLearnersPage(0);
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="h-9 min-w-32 rounded-lg text-xs"
                  >
                    <SelectValue>
                      {learnerStatusFilter === "all"
                        ? "All status"
                        : learnerStatusFilter.charAt(0).toUpperCase() +
                          learnerStatusFilter.slice(1)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-b border-border/80">
                <Table>
                  <TableHeader className="[&_th]:px-4 [&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg [&_tr]:border-0 [&_tr]:bg-muted/50 [&_tr]:hover:bg-muted/50">
                    <TableRow className="hover:bg-muted/50">
                      <TableHead>Learner</TableHead>
                      <TableHead>Email / ID</TableHead>
                      <TableHead>Enrolled on</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_td]:px-4 [&_td]:py-3 [&_tr]:hover:bg-transparent">
                    {paginatedTabLearners.length ? (
                      paginatedTabLearners.map((student) => (
                        <TableRow
                          key={student.id}
                          className="hover:bg-transparent"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="bg-primary/15">
                                <AvatarImage
                                  src={student.learner?.image ?? undefined}
                                />
                                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                                  {initials(student.learner)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-semibold text-foreground">
                                {student.learner
                                  ? `${student.learner.firstName} ${student.learner.lastName}`
                                  : "Learner profile"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {student.learner?.email ?? student.studentId}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDayMonthYear(student.enrolledAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`rounded-full px-3 py-0.5 text-[11px] font-medium capitalize ${
                                student.status.toLowerCase() === "active"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  : "border-muted-foreground/20 bg-muted text-muted-foreground"
                              }`}
                            >
                              {student.status.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-xs"
                                      className="size-7 text-muted-foreground hover:text-foreground"
                                      aria-label="Learner actions"
                                    />
                                  }
                                >
                                  <MoreHorizontal className="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-40"
                                >
                                  <DropdownMenuItem
                                    onClick={() => setIsLearnerOpen(true)}
                                  >
                                    <Users /> Manage learners
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5}>
                          <Empty className="min-h-36 flex-none border-0 bg-transparent px-4 py-6">
                            <EmptyHeader className="gap-1">
                              <EmptyMedia
                                variant="icon"
                                className="mb-1 size-9"
                              >
                                <Users className="size-4" />
                              </EmptyMedia>
                              <EmptyTitle className="text-base">
                                No learners enrolled
                              </EmptyTitle>
                              <EmptyDescription className="max-w-xs text-xs">
                                Enroll learners to build this classroom roster.
                              </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent className="mt-0">
                              <Button
                                size="sm"
                                disabled={!canManageLearners}
                                onClick={() => setIsLearnerOpen(true)}
                              >
                                <Plus className="size-3.5" /> Enroll learners
                              </Button>
                            </EmptyContent>
                          </Empty>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between px-2 pt-1 text-xs">
                <span className="flex-1 text-muted-foreground">
                  {filteredTabLearners.length} total item(s)
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    Page {currentLearnersTabPage + 1} of {totalLearnersTabPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setLearnersPage(0)}
                      disabled={currentLearnersTabPage === 0}
                      aria-label="First page"
                    >
                      <ChevronsLeft />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        setLearnersPage((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentLearnersTabPage === 0}
                      aria-label="Previous page"
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        setLearnersPage((prev) =>
                          Math.min(totalLearnersTabPages - 1, prev + 1),
                        )
                      }
                      disabled={
                        currentLearnersTabPage >= totalLearnersTabPages - 1
                      }
                      aria-label="Next page"
                    >
                      <ChevronRight />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        setLearnersPage(totalLearnersTabPages - 1)
                      }
                      disabled={
                        currentLearnersTabPage >= totalLearnersTabPages - 1
                      }
                      aria-label="Last page"
                    >
                      <ChevronsRight />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
            <Card size="sm" className="bg-card/60 py-3 shadow-none">
              <CardContent className="gap-1 px-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-10 w-full justify-start gap-2.5 rounded-lg px-3 text-xs font-medium ${
                    settingsSection === "general"
                      ? "border border-primary/30 bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                  onClick={() => setSettingsSection("general")}
                >
                  <Settings className="size-4" /> General
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-10 w-full justify-start gap-2.5 rounded-lg px-3 text-xs font-medium ${
                    settingsSection === "schedule"
                      ? "border border-primary/30 bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                  onClick={() => setSettingsSection("schedule")}
                >
                  <CalendarDays className="size-4" /> Schedule
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-10 w-full justify-start gap-2.5 rounded-lg px-3 text-xs font-medium ${
                    settingsSection === "enrollment"
                      ? "border border-primary/30 bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                  onClick={() => setSettingsSection("enrollment")}
                >
                  <Users className="size-4" /> Access &amp; Enrollment
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-10 w-full justify-start gap-2.5 rounded-lg px-3 text-xs font-medium ${
                    settingsSection === "lifecycle"
                      ? "border border-primary/30 bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                  onClick={() => setSettingsSection("lifecycle")}
                >
                  <Power className="size-4" /> Lifecycle
                </Button>
              </CardContent>
            </Card>

            {settingsSection === "general" ? (
              <Card size="sm" className="gap-5 bg-card/60 py-5 shadow-none">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Settings className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <CardTitle className="font-sans text-lg font-bold">
                        General
                      </CardTitle>
                      <CardDescription className="mt-0.5 text-xs">
                        Update the classroom&apos;s basic information.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Classroom name
                      </Label>
                      <Input
                        value={settingsName}
                        onChange={(event) =>
                          setSettingsName(event.target.value)
                        }
                        disabled={!canUpdate}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Subject
                      </Label>
                      <Select
                        value={settingsSubjectId}
                        onValueChange={(value) =>
                          setSettingsSubjectId(value ?? "")
                        }
                        disabled={!canUpdate}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {subjects.data?.find(
                              (subject) => subject.id === settingsSubjectId,
                            )?.name ?? subjectName}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {(subjects.data ?? []).map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Description (optional)
                    </Label>
                    <Textarea
                      className="min-h-24 rounded-lg px-3 py-2 text-sm"
                      value={settingsDescription}
                      onChange={(event) =>
                        setSettingsDescription(event.target.value)
                      }
                      disabled={!canUpdate}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-lg px-4 text-xs font-medium"
                      onClick={() => {
                        setSettingsName(classroom.data.name);
                        setSettingsSubjectId(classroom.data.subjectId);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="h-9 rounded-lg px-4 text-xs font-semibold"
                      disabled={!canUpdate}
                    >
                      Save changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {settingsSection === "schedule" ? (
              <Card size="sm" className="gap-5 bg-card/60 py-5 shadow-none">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <CardTitle className="font-sans text-lg font-bold">
                        Schedule
                      </CardTitle>
                      <CardDescription className="mt-0.5 text-xs">
                        Manage the recurring weekly teaching schedule and
                        lesson duration.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Teaching days
                      </Label>
                      <Input value={daysLabel} disabled />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Start time
                      </Label>
                      <Input
                        value={settingsStartTime}
                        onChange={(event) =>
                          setSettingsStartTime(event.target.value)
                        }
                        disabled={!canUpdate}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Lesson duration
                      </Label>
                      <Select
                        value={settingsDurationMins}
                        onValueChange={(value) =>
                          setSettingsDurationMins(value ?? "60")
                        }
                        disabled={!canUpdate}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {settingsDurationMins} minutes
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {[30, 45, 60, 75, 90, 120].map((mins) => (
                            <SelectItem key={mins} value={String(mins)}>
                              {mins} minutes
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Timezone
                      </Label>
                      <Input
                        value={formatTimezoneDisplay(
                          classroom.data.recurrence.timezone,
                        )}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-lg px-4 text-xs font-medium"
                      onClick={() => {
                        setSettingsDurationMins(
                          String(classroom.data.lessonDurationMins),
                        );
                        setSettingsStartTime(
                          classroom.data.recurrence.startTime,
                        );
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="h-9 rounded-lg px-4 text-xs font-semibold"
                      disabled={!canUpdate}
                    >
                      Save changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {settingsSection === "enrollment" ? (
              <Card size="sm" className="gap-5 bg-card/60 py-5 shadow-none">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <CardTitle className="font-sans text-lg font-bold">
                        Access &amp; Enrollment
                      </CardTitle>
                      <CardDescription className="mt-0.5 text-xs">
                        Configure learner capacity and classroom enrollment
                        rules.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Maximum learner capacity
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={settingsMaxStudents}
                        onChange={(event) =>
                          setSettingsMaxStudents(event.target.value)
                        }
                        disabled={!canUpdate}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Primary teacher
                      </Label>
                      <Input value={teacherName} disabled />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-lg px-4 text-xs font-medium"
                      onClick={() =>
                        setSettingsMaxStudents(
                          String(classroom.data.maxStudents ?? 10),
                        )
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="h-9 rounded-lg px-4 text-xs font-semibold"
                      disabled={!canUpdate}
                    >
                      Save changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {settingsSection === "lifecycle" ? (
              <Card size="sm" className="gap-5 bg-card/60 py-5 shadow-none">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Power className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <CardTitle className="font-sans text-lg font-bold">
                        Lifecycle
                      </CardTitle>
                      <CardDescription className="mt-0.5 text-xs">
                        Pause teaching activity or permanently close this
                        classroom.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Pause classroom
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Temporarily suspend recurring lesson generation for
                        this classroom.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        !canUpdate ||
                        normalizedStatus !== "active" ||
                        pauseClassroom.isPending
                      }
                      onClick={() => pauseClassroom.mutate(classroom.data.id)}
                    >
                      Pause classroom
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Close classroom
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Permanently close this classroom and stop all future
                        teaching activity.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={
                        !canUpdate ||
                        normalizedStatus === "closed" ||
                        closeClassroom.isPending
                      }
                      onClick={() => closeClassroom.mutate(classroom.data.id)}
                    >
                      Close classroom
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      <ScheduleLessonDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        isSubmitting={scheduleLesson.isPending}
        onSubmit={(input) =>
          scheduleLesson.mutate(input, {
            onSuccess: () => setIsScheduleOpen(false),
          })
        }
      />
      <AddLearnerDialog
        open={isLearnerOpen}
        onOpenChange={setIsLearnerOpen}
        learners={learnerCandidates.data ?? []}
        isSubmitting={addLearner.isPending}
        onSubmit={(studentId) =>
          addLearner.mutate(studentId, {
            onSuccess: () => setIsLearnerOpen(false),
          })
        }
      />
      <ScheduleLessonDialog
        open={Boolean(reschedulingLesson)}
        onOpenChange={(open) => !open && setReschedulingLesson(null)}
        mode="reschedule"
        initialLesson={reschedulingLesson}
        isSubmitting={rescheduleLesson.isPending}
        onSubmit={(input) => {
          if (!reschedulingLesson) return;
          rescheduleLesson.mutate(
            { lessonId: reschedulingLesson.id, ...input },
            { onSuccess: () => setReschedulingLesson(null) },
          );
        }}
      />
    </section>
  );
}

function getLessonStatusClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "completed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }
  if (normalized === "scheduled") {
    return "border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-400";
  }
  if (normalized === "cancelled" || normalized === "canceled") {
    return "border-destructive/40 bg-destructive/10 text-destructive";
  }
  return "border-muted-foreground/20 bg-muted text-muted-foreground";
}

function formatLongDate(value: string): string {
  const date = new Date(value);
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(
    date,
  );
  const rest = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  return `${weekday}, ${rest}`;
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(
    date,
  );
  const rest = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  return `${weekday}, ${rest}`;
}

function formatFullWeekday(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(
    new Date(value),
  );
}

function formatDayMonthYear(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTimeClock(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatClockTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2024, 0, 1, hours, minutes));
}

function formatTimezoneDisplay(timezone: string): string {
  if (timezone === "Africa/Lagos") return "Africa/Lagos (WAT)";
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    const abbr = parts.find((part) => part.type === "timeZoneName")?.value;
    if (abbr && !abbr.startsWith("GMT") && !abbr.startsWith("UTC+")) {
      return `${timezone} (${abbr})`;
    }
  } catch {
    // Ignore invalid timezones
  }
  return timezone;
}

function initials(learner: { firstName: string; lastName: string } | null) {
  return learner
    ? `${learner.firstName[0] ?? ""}${learner.lastName[0] ?? ""}`
    : "L";
}
