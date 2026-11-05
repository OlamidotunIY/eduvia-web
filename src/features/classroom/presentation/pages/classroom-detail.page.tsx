import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  ChartNoAxesCombined,
  Clock3,
  MoreHorizontal,
  Pencil,
  Settings2,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { sessionStore } from "@/shared/store";
import {
  useClassroomDetailQuery,
  useClassroomLessonsQuery,
  useClassroomStudentsQuery,
  useLearnerCandidatesQuery,
  useScheduleLessonMutation,
  useAddLearnerMutation,
  useOrganizationSubjectsQuery,
} from "../../application";
import {
  AddLearnerDialog,
  ScheduleLessonDialog,
} from "../components/classroom-action-dialogs";

type DetailTab = "overview" | "learners" | "lessons" | "settings";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ClassroomDetailPage() {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const [tab, setTab] = useState<DetailTab>("overview");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isLearnerOpen, setIsLearnerOpen] = useState(false);
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
  const addLearner = useAddLearnerMutation(organizationId, classroomId);
  const subjectName = useMemo(
    () =>
      subjects.data?.find((subject) => subject.id === classroom.data?.subjectId)
        ?.name ?? "Subject",
    [classroom.data?.subjectId, subjects.data],
  );

  if (classroom.isPending) return <DetailSkeleton />;

  if (!classroom.data) {
    return (
      <section className="mx-auto flex max-w-xl flex-1 flex-col items-start py-16">
        <p className="text-sm font-medium text-primary">Classroom</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
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
  const schedule = `${classroom.data.recurrence.daysOfWeek.map((day) => dayNames[day]).join(", ")} · ${classroom.data.recurrence.startTime}`;

  return (
    <TooltipProvider>
      <section className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2"
              onClick={() => navigate(APP_ROUTES.CLASSROOMS)}
            >
              <ArrowLeft /> All classrooms
            </Button>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                {classroom.data.name}
              </h1>
              <Badge
                variant={
                  classroom.data.status === "active" ? "default" : "secondary"
                }
              >
                {classroom.data.status}
              </Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="size-4" /> {subjectName}
              <span aria-hidden>·</span>
              <CalendarClock className="size-4" /> {schedule}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PermissionButton
              allowed={canScheduleLessons}
              reason="You need lesson scheduling permission to schedule a lesson."
              onClick={() => setIsScheduleOpen(true)}
            >
              <CalendarClock /> Schedule lesson
            </PermissionButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Classroom actions"
                  />
                }
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <PermissionMenuItem
                  allowed={canUpdate}
                  reason="You need classroom update permission to edit this classroom."
                >
                  <Pencil /> Edit classroom
                </PermissionMenuItem>
                <PermissionMenuItem
                  allowed={canUpdate}
                  reason="You need classroom update permission to change this classroom status."
                >
                  <Settings2 /> Pause or close
                </PermissionMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(value) => setTab(value as DetailTab)}>
          <TabsList
            aria-label="Classroom sections"
            className="w-full justify-start overflow-x-auto"
          >
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="learners">Learners</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Overview
              classroom={classroom.data}
              learnerCount={
                students.data?.filter((student) => student.status === "active")
                  .length ?? 0
              }
              lessonCount={lessons.data?.length ?? 0}
              lessons={lessons.data ?? []}
            />
          </TabsContent>

          <TabsContent value="learners">
            <SectionHeader
              title="Learners"
              description="Manage the learners enrolled in this classroom."
              action={
                <PermissionButton
                  allowed={canManageLearners}
                  reason="You need learner management permission to add learners."
                  onClick={() => setIsLearnerOpen(true)}
                >
                  <Users /> Add learner
                </PermissionButton>
              }
            />
            {students.isPending ? (
              <p className="py-12 text-sm text-muted-foreground">
                Loading learners…
              </p>
            ) : (
              <LearnerGrid students={students.data ?? []} />
            )}
          </TabsContent>

          <TabsContent value="lessons">
            <SectionHeader
              title="Lessons"
              description="Your teaching agenda, ordered by the next lesson first."
              action={
                <PermissionButton
                  allowed={canScheduleLessons}
                  reason="You need lesson scheduling permission to schedule a lesson."
                  onClick={() => setIsScheduleOpen(true)}
                >
                  <CalendarClock /> Schedule lesson
                </PermissionButton>
              }
            />
            {lessons.isPending ? (
              <p className="py-12 text-sm text-muted-foreground">
                Loading lessons…
              </p>
            ) : (
              <LessonAgenda lessons={lessons.data ?? []} />
            )}
          </TabsContent>

          <TabsContent value="settings">
            <SectionHeader
              title="Classroom settings"
              description="The teaching, capacity, and lifecycle settings for this classroom."
            />
            <ClassroomSettings classroom={classroom.data} />
          </TabsContent>
        </Tabs>
        <ScheduleLessonDialog
          open={isScheduleOpen}
          onOpenChange={setIsScheduleOpen}
          isSubmitting={scheduleLesson.isPending}
          onSubmit={(input) =>
            scheduleLesson.mutate(
              { ...input, teacherId: currentUser!.user.id },
              { onSuccess: () => setIsScheduleOpen(false) },
            )
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
      </section>
    </TooltipProvider>
  );
}

function PermissionButton({
  allowed,
  reason,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { allowed: boolean; reason: string }) {
  const button = (
    <Button disabled={!allowed} {...props}>
      {children}
    </Button>
  );
  return allowed ? (
    button
  ) : (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {button}
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

function PermissionMenuItem({
  allowed,
  reason,
  children,
}: {
  allowed: boolean;
  reason: string;
  children: React.ReactNode;
}) {
  const item = (
    <DropdownMenuItem disabled={!allowed}>{children}</DropdownMenuItem>
  );
  return allowed ? (
    item
  ) : (
    <Tooltip>
      <TooltipTrigger render={<span />}>{item}</TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        <h2 className="font-heading text-2xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

function Overview({
  classroom,
  learnerCount,
  lessonCount,
  lessons,
}: {
  classroom: {
    recurrence: {
      daysOfWeek: number[];
      startTime: string;
      effectiveUntil: string | null;
    };
    lessonDurationMins: number;
    maxStudents: number | null;
    status: string;
  };
  learnerCount: number;
  lessonCount: number;
  lessons: Array<{ scheduledAt: string; status: string }>;
}) {
  const nextLesson = lessons.find(
    (lesson) => new Date(lesson.scheduledAt).getTime() >= Date.now(),
  );
  const completed = lessons.filter(
    (lesson) => lesson.status.toLowerCase() === "completed",
  ).length;
  const learnerCapacity = classroom.maxStudents
    ? Math.min(100, Math.round((learnerCount / classroom.maxStudents) * 100))
    : 0;
  return (
    <div className="space-y-10">
      <section className="border-b border-border pb-8">
        <div className="flex items-center gap-2 text-primary">
          <ChartNoAxesCombined className="size-4" />
          <p className="text-sm font-medium">Teaching pulse</p>
        </div>
        <h2 className="mt-2 font-heading text-2xl font-semibold">
          How this classroom is running
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A concise view of schedule, learner capacity, and lesson activity.
        </p>
        <dl className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Enrolled learners"
            value={`${learnerCount}${classroom.maxStudents ? ` of ${classroom.maxStudents}` : ""}`}
            detail={
              classroom.maxStudents
                ? `${learnerCapacity}% of capacity`
                : "No capacity limit"
            }
          />
          <Metric
            label="Scheduled lessons"
            value={`${lessonCount}`}
            detail={
              completed ? `${completed} completed` : "No completed lessons yet"
            }
          />
          <Metric
            label="Next lesson"
            value={
              nextLesson
                ? formatShortDate(nextLesson.scheduledAt)
                : "Not scheduled"
            }
            detail={
              nextLesson
                ? formatTime(nextLesson.scheduledAt)
                : "Schedule a lesson to begin"
            }
          />
          <Metric
            label="Classroom status"
            value={classroom.status}
            detail="Current teaching lifecycle"
          />
        </dl>
      </section>
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,.7fr)]">
        <div>
          <h3 className="font-heading text-xl font-semibold">Weekly rhythm</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The recurring schedule learners can expect.
          </p>
          <div className="mt-6 grid divide-y divide-border border-y border-border">
            <SettingReadOnly
              label="Teaching days"
              value={classroom.recurrence.daysOfWeek
                .map((day) => dayNames[day])
                .join(", ")}
            />
            <SettingReadOnly
              label="Start time"
              value={classroom.recurrence.startTime}
            />
            <SettingReadOnly
              label="Lesson duration"
              value={`${classroom.lessonDurationMins} minutes`}
            />
            <SettingReadOnly
              label="Schedule ends"
              value={
                classroom.recurrence.effectiveUntil
                  ? formatShortDate(classroom.recurrence.effectiveUntil)
                  : "No end date"
              }
            />
          </div>
        </div>
        <div>
          <h3 className="font-heading text-xl font-semibold">Capacity</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Current learner utilisation.
          </p>
          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <p className="text-4xl font-semibold tracking-tight">
                {learnerCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {classroom.maxStudents
                  ? `/ ${classroom.maxStudents}`
                  : "learners"}
              </p>
            </div>
            {classroom.maxStudents ? (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${learnerCapacity}%` }}
                />
              </div>
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">
              {classroom.maxStudents
                ? `${classroom.maxStudents - learnerCount} learner spaces remain.`
                : "This classroom has no learner limit."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-semibold tracking-tight capitalize">
        {value}
      </dd>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function LearnerGrid({
  students,
}: {
  students: Array<{
    id: string;
    status: string;
    enrolledAt: string;
    learner: {
      firstName: string;
      lastName: string;
      email: string;
      image: string | null;
    } | null;
  }>;
}) {
  if (!students.length)
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No learners have been added yet.
      </p>
    );
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {students.map((student) => (
        <article
          key={student.id}
          className="rounded-xl border border-border p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <Avatar size="lg">
              <AvatarImage src={student.learner?.image ?? undefined} />
              <AvatarFallback>{initials(student.learner)}</AvatarFallback>
            </Avatar>
            <Badge variant="outline" className="capitalize">
              {student.status}
            </Badge>
          </div>
          <h3 className="mt-5 font-medium">
            {student.learner
              ? `${student.learner.firstName} ${student.learner.lastName}`
              : "Learner profile"}
          </h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {student.learner?.email ?? "Learner profile is unavailable"}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Enrolled {new Date(student.enrolledAt).toLocaleDateString()}
          </p>
        </article>
      ))}
    </div>
  );
}

function LessonAgenda({
  lessons,
}: {
  lessons: Array<{
    id: string;
    scheduledAt: string;
    durationMins: number;
    status: string;
  }>;
}) {
  if (!lessons.length)
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No lessons have been scheduled yet.
      </p>
    );
  return (
    <ol className="border-l border-border">
      {lessons.map((lesson) => (
        <li
          key={lesson.id}
          className="relative ml-5 border-b border-border py-5 first:pt-0"
        >
          <span className="absolute -left-[1.65rem] top-6 size-3 rounded-full border-2 border-background bg-primary first:top-1" />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">
                {formatShortDate(lesson.scheduledAt)}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock3 className="size-3.5" /> {formatTime(lesson.scheduledAt)}{" "}
                · {lesson.durationMins} minutes
              </p>
            </div>
            <Badge variant="outline" className="capitalize">
              {lesson.status}
            </Badge>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ClassroomSettings({
  classroom,
}: {
  classroom: {
    name: string;
    lessonDurationMins: number;
    maxStudents: number | null;
    recurrence: {
      daysOfWeek: number[];
      startTime: string;
      timezone: string;
      effectiveFrom: string;
      effectiveUntil: string | null;
    };
    status: string;
  };
}) {
  return (
    <div className="divide-y divide-border border-y border-border">
      <SettingsGroup title="Classroom profile">
        <SettingRow label="Classroom name" value={classroom.name} />
        <SettingRow
          label="Learner capacity"
          value={
            classroom.maxStudents
              ? `${classroom.maxStudents} learners`
              : "No limit"
          }
        />
      </SettingsGroup>
      <SettingsGroup title="Weekly schedule">
        <SettingRow
          label="Teaching days"
          value={classroom.recurrence.daysOfWeek
            .map((day) => dayNames[day])
            .join(", ")}
        />
        <SettingRow label="Start time" value={classroom.recurrence.startTime} />
        <SettingRow
          label="Lesson duration"
          value={`${classroom.lessonDurationMins} minutes`}
        />
        <SettingRow label="Time zone" value={classroom.recurrence.timezone} />
        <SettingRow
          label="Schedule end date"
          value={
            classroom.recurrence.effectiveUntil
              ? formatShortDate(classroom.recurrence.effectiveUntil)
              : "No end date"
          }
        />
      </SettingsGroup>
      <SettingsGroup title="Classroom lifecycle">
        <SettingRow label="Current status" value={classroom.status} />
      </SettingsGroup>
    </div>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-7">
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <div className="mt-3 divide-y divide-border">{children}</div>
    </section>
  );
}
function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground capitalize">{value}</p>
      </div>
    </div>
  );
}
function SettingReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function initials(learner: { firstName: string; lastName: string } | null) {
  return learner
    ? `${learner.firstName[0] ?? ""}${learner.lastName[0] ?? ""}`
    : "L";
}

function DetailSkeleton() {
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
