import { useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Funnel,
  Plus,
  RotateCcw,
} from "lucide-react";
import { sessionStore } from "@/shared/store";
import type { Classroom, ClassroomLesson } from "@/shared/domain";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shared/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import {
  useClassroomsQuery,
  useOrganizationCalendarLessonsQuery,
  useRescheduleLessonMutation,
  useScheduleLessonMutation,
} from "../../application";
import { ScheduleLessonDialog } from "../components/classroom-action-dialogs";

type CalendarView = "week" | "month";
const HOURS = Array.from({ length: 13 }, (_, index) => index + 8);

export function CalendarPage() {
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const [view, setView] = useState<CalendarView>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [classroomId, setClassroomId] = useState("all");
  const [status, setStatus] = useState("all");
  const [scope, setScope] = useState<"all" | "mine">("all");
  const [isClassroomPickerOpen, setIsClassroomPickerOpen] = useState(false);
  const [selectedExtraClassroomId, setSelectedExtraClassroomId] = useState("");
  const [scheduleClassroom, setScheduleClassroom] = useState<Classroom | null>(
    null,
  );
  const [selectedLesson, setSelectedLesson] = useState<ClassroomLesson | null>(
    null,
  );
  const [reschedulingLesson, setReschedulingLesson] =
    useState<ClassroomLesson | null>(null);

  const range = useMemo(() => getRange(anchorDate, view), [anchorDate, view]);
  const classrooms = useClassroomsQuery(organizationId);
  const lessons = useOrganizationCalendarLessonsQuery(organizationId, range);
  const scheduleLesson = useScheduleLessonMutation(
    organizationId,
    scheduleClassroom?.id,
  );
  const rescheduleLesson = useRescheduleLessonMutation(
    organizationId,
    "calendar",
  );
  const canSchedule = permissions.includes("lessons:schedule");
  const canManage = permissions.includes("lessons:manage");
  const activeFilterCount =
    Number(classroomId !== "all") +
    Number(status !== "all") +
    Number(scope !== "all");

  const classroomNameById = useMemo(
    () => new Map((classrooms.data ?? []).map((item) => [item.id, item.name])),
    [classrooms.data],
  );
  const visibleLessons = useMemo(
    () =>
      (lessons.data ?? []).filter((lesson) => {
        if (classroomId !== "all" && lesson.classroomId !== classroomId)
          return false;
        if (status !== "all" && lesson.status.toLowerCase() !== status)
          return false;
        if (scope === "mine" && lesson.teacherId !== currentUser?.user.id)
          return false;
        return true;
      }),
    [classroomId, currentUser?.user.id, lessons.data, scope, status],
  );

  const selectExtraClassroom = () => {
    const classroom = (classrooms.data ?? []).find(
      (item) => item.id === selectedExtraClassroomId,
    );
    if (!classroom) return;
    setIsClassroomPickerOpen(false);
    setScheduleClassroom(classroom);
  };
  const movePeriod = (direction: -1 | 1) => {
    const shift = (date: Date) =>
      view === "week" ? addWeeks(date, direction) : addMonths(date, direction);
    setAnchorDate(shift);
    setSelectedDay(shift);
  };
  const goToToday = () => {
    const today = new Date();
    setAnchorDate(today);
    setSelectedDay(today);
  };

  if (!organizationId) {
    return (
      <section className="mx-auto flex max-w-xl flex-1 flex-col items-start py-16">
        <p className="text-sm font-medium text-primary">Calendar</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          Choose an organization first
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Select an organization to view its lesson schedule.
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Teaching workspace</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Calendar
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Lessons across your organization, focused on the period you are
            teaching now.
          </p>
        </div>
        <Button
          disabled={!canSchedule || !(classrooms.data ?? []).length}
          title={
            canSchedule
              ? "Add a one-off lesson outside a classroom’s recurring schedule."
              : "You need lesson scheduling permission to add an extra lesson."
          }
          onClick={() => setIsClassroomPickerOpen(true)}
        >
          <Plus /> Add extra lesson
        </Button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => movePeriod(-1)}
            aria-label="Previous period"
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => movePeriod(1)}
            aria-label="Next period"
          >
            <ChevronRight />
          </Button>
          <p className="ml-2 text-sm font-medium sm:text-base">{range.label}</p>
        </div>
        <div className="flex items-center rounded-md border border-border p-0.5">
          <Button
            size="sm"
            variant={view === "week" ? "secondary" : "ghost"}
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={view === "month" ? "secondary" : "ghost"}
            onClick={() => setView("month")}
          >
            Month
          </Button>
        </div>
      </div>

      <div>
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline">
                <Funnel /> Filter
                {activeFilterCount ? (
                  <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-80">
            <PopoverHeader>
              <PopoverTitle>Filter calendar</PopoverTitle>
              <p className="text-xs text-muted-foreground">
                Refine the visible lesson schedule.
              </p>
            </PopoverHeader>
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Classroom
                <Select
                  value={classroomId}
                  onValueChange={(value) => setClassroomId(value ?? "all")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classrooms</SelectItem>
                    {(classrooms.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Lesson status
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value ?? "all")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Teaching scope
                <Select
                  value={scope}
                  onValueChange={(value) =>
                    setScope((value ?? "all") as "all" | "mine")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Organization lessons</SelectItem>
                    <SelectItem value="mine">My lessons</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                disabled={!activeFilterCount}
                onClick={() => {
                  setClassroomId("all");
                  setStatus("all");
                  setScope("all");
                }}
              >
                Clear all filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {lessons.isPending ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Loading lessons…
        </p>
      ) : view === "week" ? (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <WeekGrid
              days={range.days}
              lessons={visibleLessons}
              classroomNameById={classroomNameById}
              onSelect={setSelectedLesson}
            />
          </div>
          <div className="lg:hidden">
            <MobileAgenda
              days={range.days}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              lessons={visibleLessons}
              classroomNameById={classroomNameById}
              onSelect={setSelectedLesson}
            />
          </div>
        </>
      ) : (
        <MonthGrid
          days={range.days}
          month={anchorDate}
          lessons={visibleLessons}
          classroomNameById={classroomNameById}
          onSelect={setSelectedLesson}
        />
      )}

      <Dialog
        open={isClassroomPickerOpen}
        onOpenChange={setIsClassroomPickerOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add extra lesson</DialogTitle>
            <DialogDescription>
              Choose the classroom for this one-off lesson.
            </DialogDescription>
          </DialogHeader>
          <Select
            value={selectedExtraClassroomId || undefined}
            onValueChange={(value) => setSelectedExtraClassroomId(value ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a classroom" />
            </SelectTrigger>
            <SelectContent>
              {(classrooms.data ?? []).map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter showCloseButton>
            <Button
              disabled={!selectedExtraClassroomId}
              onClick={selectExtraClassroom}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScheduleLessonDialog
        open={Boolean(scheduleClassroom)}
        onOpenChange={(open) => !open && setScheduleClassroom(null)}
        isSubmitting={scheduleLesson.isPending}
        onSubmit={(input) =>
          scheduleLesson.mutate(input, {
            onSuccess: () => setScheduleClassroom(null),
          })
        }
      />

      <Sheet
        open={Boolean(selectedLesson)}
        onOpenChange={(open) => !open && setSelectedLesson(null)}
      >
        <SheetContent>
          {selectedLesson ? (
            <>
              <SheetHeader>
                <SheetTitle>
                  {classroomNameById.get(selectedLesson.classroomId) ??
                    "Classroom lesson"}
                </SheetTitle>
                <SheetDescription>
                  {formatLessonDate(selectedLesson.scheduledAt)} ·{" "}
                  {formatLessonTime(selectedLesson.scheduledAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 p-4">
                <div className="flex items-center justify-between border-y border-border py-4">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <LessonStatus status={selectedLesson.status} />
                </div>
                <DetailRow
                  label="Duration"
                  value={`${selectedLesson.durationMins} minutes`}
                />
                <DetailRow
                  label="Lesson type"
                  value={
                    selectedLesson.origin === "ONE_OFF"
                      ? "Extra lesson"
                      : "Recurring lesson"
                  }
                />
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={!canManage}
                  title={
                    canManage
                      ? "Reschedule lesson"
                      : "You need lesson management permission to reschedule a lesson."
                  }
                  onClick={() => {
                    setSelectedLesson(null);
                    setReschedulingLesson(selectedLesson);
                  }}
                >
                  <RotateCcw /> Reschedule lesson
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

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

function WeekGrid({
  days,
  lessons,
  classroomNameById,
  onSelect,
}: CalendarGridProps & { days: Date[] }) {
  return (
    <div className="min-w-[72rem] border border-border">
      <div className="grid grid-cols-[4rem_repeat(7,minmax(9.5rem,1fr))] border-b border-border bg-muted/30">
        <div />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="border-l border-border px-3 py-3"
          >
            <p className="text-xs text-muted-foreground">
              {format(day, "EEE")}
            </p>
            <p className="mt-1 text-lg font-semibold">{format(day, "d")}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[4rem_repeat(7,minmax(9.5rem,1fr))]">
        <div className="relative h-[832px] border-r border-border">
          {HOURS.map((hour) => (
            <span
              key={hour}
              className="absolute -top-2 right-2 text-[10px] text-muted-foreground"
              style={{ top: `${(hour - 8) * 64}px` }}
            >
              {formatHour(hour)}
            </span>
          ))}
        </div>
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="relative h-[832px] border-r border-border last:border-r-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent, transparent 63px, var(--border) 64px)",
            }}
          >
            {lessons
              .filter((lesson) => isSameDay(new Date(lesson.scheduledAt), day))
              .map((lesson) => (
                <LessonBlock
                  key={lesson.id}
                  lesson={lesson}
                  classroomName={classroomNameById.get(lesson.classroomId)}
                  onSelect={onSelect}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileAgenda({
  days,
  selectedDay,
  onSelectDay,
  lessons,
  classroomNameById,
  onSelect,
}: CalendarGridProps & {
  days: Date[];
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
}) {
  const dayLessons = lessons.filter((lesson) =>
    isSameDay(new Date(lesson.scheduledAt), selectedDay),
  );
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-3">
        {days.map((day) => (
          <Button
            key={day.toISOString()}
            size="sm"
            variant={isSameDay(day, selectedDay) ? "secondary" : "ghost"}
            onClick={() => onSelectDay(day)}
            className="min-w-14 flex-col h-auto py-2"
          >
            <span className="text-[10px]">{format(day, "EEE")}</span>
            <span>{format(day, "d")}</span>
          </Button>
        ))}
      </div>
      <AgendaList
        lessons={dayLessons}
        classroomNameById={classroomNameById}
        onSelect={onSelect}
      />
    </div>
  );
}

function MonthGrid({
  days,
  month,
  lessons,
  classroomNameById,
  onSelect,
}: CalendarGridProps & { days: Date[]; month: Date }) {
  return (
    <div className="overflow-x-auto border border-border">
      <div className="grid min-w-[48rem] grid-cols-7 border-b border-border bg-muted/30">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <p
            key={day}
            className="px-3 py-2 text-xs font-medium text-muted-foreground"
          >
            {day}
          </p>
        ))}
      </div>
      <div className="grid min-w-[48rem] grid-cols-7">
        {days.map((day) => {
          const dayLessons = lessons.filter((lesson) =>
            isSameDay(new Date(lesson.scheduledAt), day),
          );
          return (
            <div
              key={day.toISOString()}
              className="min-h-32 border-r border-b border-border p-2 last:border-r-0"
            >
              <p
                className={
                  isSameMonth(day, month)
                    ? "text-sm font-medium"
                    : "text-sm text-muted-foreground"
                }
              >
                {format(day, "d")}
              </p>
              <div className="mt-2 space-y-1">
                {dayLessons.slice(0, 2).map((lesson) => (
                  <button
                    type="button"
                    key={lesson.id}
                    onClick={() => onSelect(lesson)}
                    className="block w-full truncate rounded bg-primary/10 px-2 py-1 text-left text-[11px] font-medium text-primary hover:bg-primary/15"
                  >
                    {formatLessonTime(lesson.scheduledAt)} ·{" "}
                    {classroomNameById.get(lesson.classroomId) ?? "Lesson"}
                  </button>
                ))}
                {dayLessons.length > 2 ? (
                  <p className="px-1 text-[11px] text-muted-foreground">
                    +{dayLessons.length - 2} more
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaList({
  lessons,
  classroomNameById,
  onSelect,
}: CalendarGridProps) {
  if (!lessons.length)
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No lessons in this period.
      </p>
    );
  return (
    <ol className="divide-y divide-border">
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-muted/30"
            onClick={() => onSelect(lesson)}
          >
            <div>
              <p className="font-medium">
                {classroomNameById.get(lesson.classroomId) ??
                  "Classroom lesson"}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock3 className="size-3.5" />
                {formatLessonDate(lesson.scheduledAt)} ·{" "}
                {formatLessonTime(lesson.scheduledAt)} · {lesson.durationMins}{" "}
                min
              </p>
            </div>
            <LessonStatus status={lesson.status} />
          </button>
        </li>
      ))}
    </ol>
  );
}

function LessonBlock({
  lesson,
  classroomName,
  onSelect,
}: {
  lesson: ClassroomLesson;
  classroomName?: string;
  onSelect: (lesson: ClassroomLesson) => void;
}) {
  const date = new Date(lesson.scheduledAt);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const top = Math.max(0, ((minutes - 8 * 60) / 60) * 64);
  const height = Math.max(34, (lesson.durationMins / 60) * 64 - 4);
  return (
    <button
      type="button"
      onClick={() => onSelect(lesson)}
      className="absolute inset-x-1 overflow-hidden rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-left text-xs hover:bg-primary/15"
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      <p className="truncate font-semibold">
        {classroomName ?? "Classroom lesson"}
      </p>
      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
        {formatLessonTime(lesson.scheduledAt)} · {lesson.durationMins} min
      </p>
    </button>
  );
}

function LessonStatus({ status }: { status: string }) {
  return (
    <Badge variant="outline" className="capitalize">
      {status}
    </Badge>
  );
}
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

type CalendarGridProps = {
  lessons: ClassroomLesson[];
  classroomNameById: Map<string, string>;
  onSelect: (lesson: ClassroomLesson) => void;
};

function getRange(anchorDate: Date, view: CalendarView) {
  const start =
    view === "week"
      ? startOfWeek(anchorDate, { weekStartsOn: 1 })
      : startOfMonth(anchorDate);
  const end =
    view === "week"
      ? endOfWeek(anchorDate, { weekStartsOn: 1 })
      : endOfMonth(anchorDate);
  const gridStart = startOfWeek(start, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(end, { weekStartsOn: 1 });
  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
    label:
      view === "week"
        ? `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
        : format(anchorDate, "MMMM yyyy"),
    days: eachDayOfInterval({ start: gridStart, end: gridEnd }),
  };
}

function formatHour(hour: number) {
  return format(new Date(2024, 0, 1, hour), "ha");
}
function formatLessonTime(value: string) {
  return format(new Date(value), "h:mm a");
}
function formatLessonDate(value: string) {
  return format(new Date(value), "EEE, MMM d");
}
