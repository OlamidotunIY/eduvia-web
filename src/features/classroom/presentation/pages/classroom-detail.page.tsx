import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CalendarClock,
  Clock3,
  Info,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Settings2,
  UserRound,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
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
  useRescheduleLessonMutation,
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
  const canManageLessons = permissions.includes("lessons:manage");
  const schedule = `${classroom.data.recurrence.daysOfWeek.map((day) => dayNames[day]).join(", ")} · ${classroom.data.recurrence.startTime}`;

  return (
    <TooltipProvider>
      <section className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col gap-6 py-1">
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
              allowed={canUpdate}
              reason="You need classroom update permission to edit this classroom."
              variant="outline"
              onClick={() => setTab("settings")}
            >
              <Pencil /> Edit classroom
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailMetric
            icon={UserRound}
            label="Teacher"
            value="Teacher-led"
            detail="Primary teacher"
          />
          <DetailMetric
            icon={Users}
            label="Learners"
            value={`${students.data?.filter((student) => student.status === "active").length ?? 0}${classroom.data.maxStudents ? ` / ${classroom.data.maxStudents}` : ""} enrolled`}
            detail="Current classroom roster"
          />
          <DetailMetric
            icon={CalendarDays}
            label="Weekly schedule"
            value={schedule}
            detail="Recurring teaching rhythm"
          />
          <DetailMetric
            icon={Clock3}
            label="Duration"
            value={`${classroom.data.lessonDurationMins} minutes`}
            detail="Per scheduled lesson"
          />
        </div>

        <Tabs value={tab} onValueChange={(value) => setTab(value as DetailTab)}>
          <TabsList
            aria-label="Classroom sections"
            className="w-full justify-start gap-4 overflow-x-auto border-b border-border bg-transparent p-0 pb-2"
          >
            <TabsTrigger className="h-9 flex-none rounded-full px-5 data-active:bg-primary data-active:text-primary-foreground" value="overview"><BookOpen /> Overview</TabsTrigger>
            <TabsTrigger className="h-9 flex-none rounded-full px-5 data-active:bg-primary data-active:text-primary-foreground" value="lessons"><CalendarClock /> Lessons</TabsTrigger>
            <TabsTrigger className="h-9 flex-none rounded-full px-5 data-active:bg-primary data-active:text-primary-foreground" value="learners"><Users /> Learners</TabsTrigger>
            <TabsTrigger className="h-9 flex-none rounded-full px-5 data-active:bg-primary data-active:text-primary-foreground" value="settings"><Settings2 /> Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Overview
              classroom={classroom.data}
              learnerCount={
                students.data?.filter((student) => student.status === "active")
                  .length ?? 0
              }
              lessons={lessons.data ?? []}
              students={students.data ?? []}
              subjectName={subjectName}
              onSchedule={() => setIsScheduleOpen(true)}
              onManageLearners={() => setIsLearnerOpen(true)}
              canSchedule={canScheduleLessons}
              canManageLearners={canManageLearners}
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
                  reason="You need lesson scheduling permission to add an extra lesson."
                  onClick={() => setIsScheduleOpen(true)}
                >
                  <CalendarClock /> Add extra lesson
                </PermissionButton>
              }
            />
            {lessons.isPending ? (
              <p className="py-12 text-sm text-muted-foreground">
                Loading lessons…
              </p>
            ) : (
              <LessonAgenda
                lessons={lessons.data ?? []}
                canManageLessons={canManageLessons}
                onReschedule={setReschedulingLesson}
              />
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
  lessons,
  students,
  subjectName,
  onSchedule,
  onManageLearners,
  canSchedule,
  canManageLearners,
}: {
  classroom: {
    recurrence: {
      daysOfWeek: number[];
      startTime: string;
      timezone: string;
      effectiveUntil: string | null;
    };
    lessonDurationMins: number;
    maxStudents: number | null;
    status: string;
  };
  learnerCount: number;
  lessons: Array<{
    id: string;
    scheduledAt: string;
    durationMins: number;
    status: string;
    origin: string;
  }>;
  students: Array<{
    id: string;
    status: string;
    learner: {
      firstName: string;
      lastName: string;
      email: string;
      image: string | null;
    } | null;
  }>;
  subjectName: string;
  onSchedule: () => void;
  onManageLearners: () => void;
  canSchedule: boolean;
  canManageLearners: boolean;
}) {
  const upcomingLessons = lessons.filter(
    (lesson) => new Date(lesson.scheduledAt).getTime() >= Date.now(),
  );
  const learnerRows = students.filter((student) => student.status === "active");

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,.9fr)]">
      <div className="space-y-5">
        <LessonPanel title="Upcoming lessons" description="Next scheduled lesson for this classroom." lessons={upcomingLessons.slice(0, 1)} emptyAction={<PermissionButton allowed={canSchedule} reason="You need lesson scheduling permission to schedule a lesson." size="sm" onClick={onSchedule}><CalendarClock /> Schedule lesson</PermissionButton>} />
        <LessonPanel title="Recent lessons" description="Recently held lessons and their status." lessons={lessons.filter((lesson) => new Date(lesson.scheduledAt).getTime() < Date.now()).slice(0, 3)} />
      </div>
      <div className="space-y-5">
        <Card className="gap-0 py-0 shadow-none">
          <CardHeader className="border-b py-5"><CardTitle className="flex items-center gap-2"><Info className="size-5 text-primary" />Classroom information</CardTitle><p className="text-sm text-muted-foreground">Key details about this classroom.</p></CardHeader>
          <CardContent className="divide-y px-5">
            <InfoRow label="Subject" value={subjectName} />
            <InfoRow label="Recurrence" value={`Weekly (${classroom.recurrence.daysOfWeek.map((day) => dayNames[day]).join(" & ")})`} />
            <InfoRow label="Time zone" value={classroom.recurrence.timezone} />
            <InfoRow label="Duration" value={`${classroom.lessonDurationMins} minutes`} />
            <InfoRow label="Capacity" value={classroom.maxStudents ? `${learnerCount} / ${classroom.maxStudents} learners` : `${learnerCount} learners`} />
          </CardContent>
        </Card>
        <Card className="gap-0 py-0 shadow-none">
          <CardHeader className="border-b py-5"><div className="flex items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><Users className="size-5 text-primary" />Learners</CardTitle><p className="mt-1 text-sm text-muted-foreground">Enrolled learners in this classroom.</p></div><PermissionButton allowed={canManageLearners} reason="You need learner management permission to add learners." variant="outline" size="sm" onClick={onManageLearners}>Manage learners</PermissionButton></div></CardHeader>
          <CardContent className="px-5">
            {learnerRows.length ? learnerRows.slice(0, 3).map((student) => <div key={student.id} className="flex items-center gap-3 border-b py-3 last:border-0"><span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(student.learner)}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{student.learner ? `${student.learner.firstName} ${student.learner.lastName}` : "Learner profile"}</p><p className="text-xs text-muted-foreground">Learner</p></div></div>) : <InlineEmpty icon={Users} title="No learners enrolled" description="Add learners when you are ready to build this classroom roster." action={<PermissionButton allowed={canManageLearners} reason="You need learner management permission to add learners." size="sm" variant="outline" onClick={onManageLearners}>Add learner</PermissionButton>} />}
          </CardContent>
        </Card>
      </div>
      <Card className="gap-0 py-0 shadow-none xl:col-span-2">
        <CardHeader className="border-b py-5"><CardTitle className="flex items-center gap-2"><CalendarDays className="size-5 text-primary" />Lesson schedule</CardTitle><p className="text-sm text-muted-foreground">All scheduled sessions for this classroom.</p></CardHeader>
        <CardContent className="px-4 pb-4"><Table><TableHeader className="[&_tr]:bg-muted/70"><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Duration</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{lessons.slice(0, 8).length ? lessons.slice(0, 8).map((lesson) => <TableRow key={lesson.id}><TableCell className="font-medium">{formatShortDate(lesson.scheduledAt)} · {formatTime(lesson.scheduledAt)}</TableCell><TableCell>{lesson.origin === "ONE_OFF" ? "Extra lesson" : "Lesson"}</TableCell><TableCell>{lesson.durationMins} min</TableCell><TableCell><Badge variant="outline" className="capitalize">{lesson.status}</Badge></TableCell></TableRow>) : <TableRow><TableCell colSpan={4}><InlineEmpty icon={CalendarDays} title="No scheduled lessons" description="The weekly classroom schedule will appear here once lessons are available." action={<PermissionButton allowed={canSchedule} reason="You need lesson scheduling permission to schedule a lesson." size="sm" variant="outline" onClick={onSchedule}>Schedule lesson</PermissionButton>} /></TableCell></TableRow>}</TableBody></Table></CardContent>
      </Card>
    </div>
  );
}

function DetailMetric({ icon: Icon, label, value, detail }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; detail: string }) {
  return (
    <Card className="h-[76px] gap-0 py-0 shadow-none"><CardContent className="flex h-full items-center gap-4 px-7 py-3"><Icon className="size-7 shrink-0 text-primary" /><div className="min-w-0"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-0.5 truncate text-base font-semibold">{value}</p></div></CardContent></Card>
  );
}

function LessonPanel({ title, description, lessons, emptyAction }: { title: string; description: string; lessons: Array<{ id: string; scheduledAt: string; durationMins: number; status: string }>; emptyAction?: React.ReactNode }) {
  return <Card className="gap-0 py-0 shadow-none"><CardHeader className="border-b py-5"><CardTitle className="flex items-center gap-2"><CalendarDays className="size-5 text-primary" />{title}</CardTitle><p className="text-sm text-muted-foreground">{description}</p></CardHeader><CardContent className="px-4">{lessons.length ? lessons.map((lesson) => <div key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-4 last:border-0"><div><p className="text-sm font-semibold">{formatShortDate(lesson.scheduledAt)} · {formatTime(lesson.scheduledAt)}</p><p className="mt-1 text-xs text-muted-foreground">{lesson.durationMins} minute lesson</p></div><Badge variant="outline" className="capitalize">{lesson.status}</Badge></div>) : <InlineEmpty icon={CalendarDays} title={`No ${title.toLowerCase()} yet`} description="Scheduled lessons will be shown here as soon as they are available." action={emptyAction} />}</CardContent></Card>;
}

function InlineEmpty({ icon: Icon, title, description, action }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; action?: React.ReactNode }) {
  return <Empty className="min-h-36 flex-none border-0 px-4 py-7"><EmptyHeader className="gap-1"><EmptyMedia variant="icon" className="mb-1 size-9"><Icon className="size-4" /></EmptyMedia><EmptyTitle className="text-base">{title}</EmptyTitle><EmptyDescription className="max-w-xs text-xs">{description}</EmptyDescription></EmptyHeader>{action ? <EmptyContent className="mt-0">{action}</EmptyContent> : null}</Empty>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-5 py-2.5 text-sm"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>;
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
  canManageLessons,
  onReschedule,
}: {
  lessons: Array<{
    id: string;
    scheduledAt: string;
    durationMins: number;
    status: string;
    origin: string;
  }>;
  canManageLessons: boolean;
  onReschedule: (lesson: {
    id: string;
    scheduledAt: string;
    durationMins: number;
  }) => void;
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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {lesson.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                disabled={!canManageLessons}
                title={
                  canManageLessons
                    ? "Reschedule lesson"
                    : "You need lesson management permission to reschedule a lesson."
                }
                onClick={() => onReschedule(lesson)}
              >
                <RotateCcw /> Reschedule
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {lesson.origin === "ONE_OFF"
              ? "Extra lesson"
              : "Part of the recurring classroom schedule"}
          </p>
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
