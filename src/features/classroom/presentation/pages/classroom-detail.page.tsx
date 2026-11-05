import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  MoreHorizontal,
  Pencil,
  Settings2,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
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
  useOrganizationSubjectsQuery,
} from "../../application";

type DetailTab = "overview" | "learners" | "lessons" | "settings";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ClassroomDetailPage() {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const [tab, setTab] = useState<DetailTab>("overview");
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const classroom = useClassroomDetailQuery(organizationId, classroomId);
  const students = useClassroomStudentsQuery(organizationId, classroomId);
  const lessons = useClassroomLessonsQuery(organizationId, classroomId);
  const subjects = useOrganizationSubjectsQuery(organizationId);
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
        <Button className="mt-6" variant="outline" onClick={() => navigate(APP_ROUTES.CLASSROOMS)}>
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
            <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(APP_ROUTES.CLASSROOMS)}>
              <ArrowLeft /> All classrooms
            </Button>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                {classroom.data.name}
              </h1>
              <Badge variant={classroom.data.status === "active" ? "default" : "secondary"}>
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
              onClick={() => setTab("lessons")}
            >
              <CalendarClock /> Schedule lesson
            </PermissionButton>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="Classroom actions" />}>
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <PermissionMenuItem allowed={canUpdate} reason="You need classroom update permission to edit this classroom.">
                  <Pencil /> Edit classroom
                </PermissionMenuItem>
                <PermissionMenuItem allowed={canUpdate} reason="You need classroom update permission to change this classroom status.">
                  <Settings2 /> Pause or close
                </PermissionMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(value) => setTab(value as DetailTab)}>
          <TabsList aria-label="Classroom sections" className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="learners">Learners</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Weekly schedule</CardTitle>
                <CardDescription>The recurring teaching schedule for this classroom.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <Metric label="Meets" value={classroom.data.recurrence.daysOfWeek.map((day) => dayNames[day]).join(", ")} />
                <Metric label="Start time" value={classroom.data.recurrence.startTime} />
                <Metric label="Duration" value={`${classroom.data.lessonDurationMins} minutes`} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Classroom at a glance</CardTitle>
              </CardHeader>
              <CardContent>
                <Metric label="Learners" value={`${students.data?.filter((student) => student.status === "active").length ?? 0}${classroom.data.maxStudents ? ` / ${classroom.data.maxStudents}` : ""}`} />
                <Metric label="Lessons" value={`${lessons.data?.length ?? 0} scheduled`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learners">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Learners</CardTitle>
                <CardDescription>Manage the learners enrolled in this classroom.</CardDescription>
              </div>
              <PermissionButton allowed={canManageLearners} reason="You need learner management permission to add learners.">
                <Users /> Add learner
              </PermissionButton>
            </CardHeader>
            <CardContent>{students.isPending ? <p className="text-sm text-muted-foreground">Loading learners…</p> : <LearnerList students={students.data ?? []} />}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Lessons</CardTitle>
                <CardDescription>Scheduled lessons and their current delivery status.</CardDescription>
              </div>
              <PermissionButton allowed={canScheduleLessons} reason="You need lesson scheduling permission to schedule a lesson.">
                <CalendarClock /> Schedule lesson
              </PermissionButton>
            </CardHeader>
            <CardContent>{lessons.isPending ? <p className="text-sm text-muted-foreground">Loading lessons…</p> : <LessonList lessons={lessons.data ?? []} />}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Classroom settings</CardTitle>
              <CardDescription>Update the schedule, learner capacity, and classroom status.</CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionButton allowed={canUpdate} reason="You need classroom update permission to change settings.">
                <Pencil /> Edit classroom settings
              </PermissionButton>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </section>
    </TooltipProvider>
  );
}

function PermissionButton({ allowed, reason, children, ...props }: React.ComponentProps<typeof Button> & { allowed: boolean; reason: string }) {
  const button = <Button disabled={!allowed} {...props}>{children}</Button>;
  return allowed ? button : <Tooltip><TooltipTrigger render={<span className="inline-flex" />}>{button}</TooltipTrigger><TooltipContent>{reason}</TooltipContent></Tooltip>;
}

function PermissionMenuItem({ allowed, reason, children }: { allowed: boolean; reason: string; children: React.ReactNode }) {
  const item = <DropdownMenuItem disabled={!allowed}>{children}</DropdownMenuItem>;
  return allowed ? item : <Tooltip><TooltipTrigger render={<span />}>{item}</TooltipTrigger><TooltipContent>{reason}</TooltipContent></Tooltip>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>;
}

function LearnerList({ students }: { students: Array<{ id: string; studentId: string; status: string; enrolledAt: string }> }) {
  if (!students.length) return <p className="py-8 text-center text-sm text-muted-foreground">No learners have been added yet.</p>;
  return <div className="divide-y divide-border">{students.map((student) => <div key={student.id} className="flex items-center justify-between py-3"><div><p className="font-medium">Learner</p><p className="text-xs text-muted-foreground">Enrolled {new Date(student.enrolledAt).toLocaleDateString()}</p></div><Badge variant="outline">{student.status}</Badge></div>)}</div>;
}

function LessonList({ lessons }: { lessons: Array<{ id: string; scheduledAt: string; durationMins: number; status: string }> }) {
  if (!lessons.length) return <p className="py-8 text-center text-sm text-muted-foreground">No lessons have been scheduled yet.</p>;
  return <div className="divide-y divide-border">{lessons.map((lesson) => <div key={lesson.id} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium">{new Date(lesson.scheduledAt).toLocaleString()}</p><p className="text-xs text-muted-foreground">{lesson.durationMins} minutes</p></div><Badge variant="outline">{lesson.status}</Badge></div>)}</div>;
}

function DetailSkeleton() { return <section className="flex flex-1 flex-col gap-6"><Skeleton className="h-28 w-full" /><Skeleton className="h-10 w-full" /><div className="grid gap-4 lg:grid-cols-3"><Skeleton className="h-56 lg:col-span-2" /><Skeleton className="h-56" /></div></section>; }
