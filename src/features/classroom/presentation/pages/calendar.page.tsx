import { useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  startOfDay,
  startOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Funnel,
  RotateCcw,
} from "lucide-react";
import { useMainHeaderSlot } from "@/app/shell/main/header";
import { sessionStore } from "@/shared/store";
import type { Classroom, ClassroomLesson } from "@/shared/domain";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Checkbox } from "@/shared/ui/checkbox";
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
  useCreateClassroomMutation,
  useOrganizationCalendarLessonsQuery,
  useOrganizationSubjectsQuery,
  useRescheduleLessonMutation,
  useScheduleLessonMutation,
} from "../../application";
import { ScheduleLessonDialog } from "../components/classroom-action-dialogs";
import { CreateClassroomDialog } from "../components/create-classroom-dialog";

type CalendarView = "week" | "month" | "schedule";
const HOURS = Array.from({ length: 24 }, (_, index) => index);

export function CalendarPage() {
  const currentUser = sessionStore((state) => state.currentUser);
  const organizationId = currentUser?.activeOrganization?.id;
  const permissions = currentUser?.activeOrganization?.permissions ?? [];
  const [view, setView] = useState<CalendarView>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [classroomIds, setClassroomIds] = useState<string[]>([]);
  const [lessonStatuses, setLessonStatuses] = useState<string[]>([]);
  const [mineOnly, setMineOnly] = useState(false);
  const [isClassroomPickerOpen, setIsClassroomPickerOpen] = useState(false);
  const [selectedExtraClassroomId, setSelectedExtraClassroomId] = useState("");
  const [scheduleClassroom, setScheduleClassroom] = useState<Classroom | null>(
    null,
  );
  const [lessonDraft, setLessonDraft] = useState<{
    scheduledAt: string;
    durationMins: number;
  } | null>(null);
  const [scheduleChoiceDraft, setScheduleChoiceDraft] = useState<{
    scheduledAt: string;
    durationMins: number;
  } | null>(null);
  const [recurringScheduleDraft, setRecurringScheduleDraft] = useState<{
    scheduledAt: string;
    durationMins: number;
  } | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<ClassroomLesson | null>(
    null,
  );
  const [reschedulingLesson, setReschedulingLesson] =
    useState<ClassroomLesson | null>(null);
  const { element: headerSlot } = useMainHeaderSlot();

  const range = useMemo(() => getRange(anchorDate, view), [anchorDate, view]);
  const classrooms = useClassroomsQuery(organizationId);
  const subjects = useOrganizationSubjectsQuery(organizationId);
  const lessons = useOrganizationCalendarLessonsQuery(organizationId, range);
  const createClassroom = useCreateClassroomMutation(organizationId);
  const scheduleLesson = useScheduleLessonMutation(
    organizationId,
    scheduleClassroom?.id,
  );
  const rescheduleLesson = useRescheduleLessonMutation(
    organizationId,
    "calendar",
  );
  const canSchedule = permissions.includes("lessons:schedule");
  const canCreateClassroom = permissions.includes("classrooms:create");
  const canManage = permissions.includes("lessons:manage");
  const activeFilterCount =
    classroomIds.length + lessonStatuses.length + Number(mineOnly);

  const classroomNameById = useMemo(
    () => new Map((classrooms.data ?? []).map((item) => [item.id, item.name])),
    [classrooms.data],
  );
  const visibleLessons = useMemo(
    () =>
      (lessons.data ?? []).filter((lesson) => {
        if (
          classroomIds.length > 0 &&
          !classroomIds.includes(lesson.classroomId)
        )
          return false;
        if (
          lessonStatuses.length > 0 &&
          !lessonStatuses.includes(lesson.status.toLowerCase())
        )
          return false;
        if (mineOnly && lesson.teacherId !== currentUser?.user.id) return false;
        return true;
      }),
    [
      classroomIds,
      currentUser?.user.id,
      lessonStatuses,
      lessons.data,
      mineOnly,
    ],
  );

  const toggleClassroom = (id: string) => {
    setClassroomIds((current) => toggleFilterValue(current, id));
  };
  const toggleLessonStatus = (value: string) => {
    setLessonStatuses((current) => toggleFilterValue(current, value));
  };

  const selectExtraClassroom = () => {
    const classroom = (classrooms.data ?? []).find(
      (item) => item.id === selectedExtraClassroomId,
    );
    if (!classroom) return;
    setIsClassroomPickerOpen(false);
    setScheduleClassroom(classroom);
  };
  const openExtraLesson = (
    draft: { scheduledAt: string; durationMins: number } | null = null,
  ) => {
    setLessonDraft(draft);
    setIsClassroomPickerOpen(true);
  };
  const openScheduleChoice = (draft: {
    scheduledAt: string;
    durationMins: number;
  }) => setScheduleChoiceDraft(draft);
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
    <>
      {headerSlot
        ? createPortal(
            <div className="flex w-full min-w-0 items-center justify-between gap-3 overflow-x-auto">
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => movePeriod(-1)}
                  aria-label="Previous period"
                >
                  <ChevronLeft />
                </Button>
                <Button variant="ghost" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => movePeriod(1)}
                  aria-label="Next period"
                >
                  <ChevronRight />
                </Button>
                <p className="ml-1 hidden whitespace-nowrap text-sm font-medium lg:block">
                  {range.label}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="relative shrink-0"
                        aria-label="Filter calendar"
                        title="Filter calendar"
                      >
                        <Funnel />
                        {activeFilterCount ? (
                          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {activeFilterCount}
                          </span>
                        ) : null}
                      </Button>
                    }
                  />
                  <PopoverContent
                    align="end"
                    className="w-[min(34rem,calc(100vw-2rem))]"
                  >
                    <PopoverHeader>
                      <PopoverTitle>Filter calendar</PopoverTitle>
                      <p className="text-xs text-muted-foreground">
                        Refine the visible lesson schedule.
                      </p>
                    </PopoverHeader>
                    <div className="grid gap-5">
                      <FilterGroup title="Classrooms">
                        {(classrooms.data ?? []).map((classroom) => (
                          <FilterOption
                            key={classroom.id}
                            checked={classroomIds.includes(classroom.id)}
                            onCheckedChange={() =>
                              toggleClassroom(classroom.id)
                            }
                          >
                            {classroom.name}
                          </FilterOption>
                        ))}
                        {!classrooms.data?.length ? (
                          <p className="text-sm text-muted-foreground">
                            No classrooms available.
                          </p>
                        ) : null}
                      </FilterGroup>
                      <FilterGroup
                        title="Lesson status"
                        className="sm:grid-cols-3"
                      >
                        {[
                          ["scheduled", "Scheduled"],
                          ["completed", "Completed"],
                          ["cancelled", "Cancelled"],
                        ].map(([value, label]) => (
                          <FilterOption
                            key={value}
                            checked={lessonStatuses.includes(value)}
                            onCheckedChange={() => toggleLessonStatus(value)}
                          >
                            {label}
                          </FilterOption>
                        ))}
                      </FilterGroup>
                      <FilterGroup title="Teaching scope">
                        <FilterOption
                          checked={mineOnly}
                          onCheckedChange={setMineOnly}
                        >
                          My lessons only
                        </FilterOption>
                      </FilterGroup>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start"
                        disabled={!activeFilterCount}
                        onClick={() => {
                          setClassroomIds([]);
                          setLessonStatuses([]);
                          setMineOnly(false);
                        }}
                      >
                        Clear all filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
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
                  <Button
                    size="sm"
                    variant={view === "schedule" ? "secondary" : "ghost"}
                    onClick={() => setView("schedule")}
                  >
                    Schedule
                  </Button>
                </div>
              </div>
            </div>,
            headerSlot,
          )
        : null}
      <section className="flex min-h-0 flex-1 flex-col">
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
                onSlotSelect={openScheduleChoice}
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
        ) : view === "month" ? (
          <MonthGrid
            days={range.days}
            month={anchorDate}
            lessons={visibleLessons}
            classroomNameById={classroomNameById}
            onSelect={setSelectedLesson}
            onSlotSelect={openScheduleChoice}
          />
        ) : (
          <ScheduleList
            lessons={visibleLessons}
            classroomNameById={classroomNameById}
            onSelect={setSelectedLesson}
          />
        )}

        <Dialog
          open={Boolean(scheduleChoiceDraft)}
          onOpenChange={(open) => !open && setScheduleChoiceDraft(null)}
        >
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Add to calendar</DialogTitle>
              <DialogDescription>
                {scheduleChoiceDraft
                  ? `${formatLessonDate(scheduleChoiceDraft.scheduledAt)} at ${formatLessonTime(scheduleChoiceDraft.scheduledAt)}`
                  : "Choose how this time should be used."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                className="h-auto items-start justify-start px-4 py-4 text-left whitespace-normal"
                disabled={!canSchedule}
                onClick={() => {
                  const draft = scheduleChoiceDraft;
                  setScheduleChoiceDraft(null);
                  openExtraLesson(draft);
                }}
              >
                <span>
                  <span className="block font-semibold">One-time lesson</span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    Add a single extra lesson to an existing classroom.
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto items-start justify-start px-4 py-4 text-left whitespace-normal"
                disabled={!canCreateClassroom}
                onClick={() => {
                  setRecurringScheduleDraft(scheduleChoiceDraft);
                  setScheduleChoiceDraft(null);
                }}
              >
                <span>
                  <span className="block font-semibold">Weekly schedule</span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    Create a classroom that repeats weekly from this slot.
                  </span>
                </span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
              onValueChange={(value) =>
                setSelectedExtraClassroomId(value ?? "")
              }
            >
              <SelectTrigger className="w-full">
                <span
                  className={
                    selectedExtraClassroomId
                      ? "flex-1 truncate text-left"
                      : "flex-1 text-left text-muted-foreground"
                  }
                >
                  {(classrooms.data ?? []).find(
                    (item) => item.id === selectedExtraClassroomId,
                  )?.name ?? "Select a classroom"}
                </span>
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
          onOpenChange={(open) => {
            if (!open) {
              setScheduleClassroom(null);
              setLessonDraft(null);
            }
          }}
          isSubmitting={scheduleLesson.isPending}
          initialLesson={lessonDraft}
          onSubmit={(input) =>
            scheduleLesson.mutate(input, {
              onSuccess: () => {
                setScheduleClassroom(null);
                setLessonDraft(null);
              },
            })
          }
        />

        <CreateClassroomDialog
          open={Boolean(recurringScheduleDraft)}
          onOpenChange={(open) => !open && setRecurringScheduleDraft(null)}
          subjects={subjects.data ?? []}
          initialSchedule={recurringScheduleDraft}
          isSubmitting={createClassroom.isPending}
          error={createClassroom.error}
          onSubmit={(input) =>
            createClassroom.mutate(input, {
              onSuccess: () => setRecurringScheduleDraft(null),
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
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
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
    </>
  );
}

function WeekGrid({
  days,
  lessons,
  classroomNameById,
  onSelect,
  onSlotSelect,
}: CalendarGridProps & {
  days: Date[];
  onSlotSelect: (draft: { scheduledAt: string; durationMins: number }) => void;
}) {
  return (
    <div className="max-h-[calc(100dvh-7.5rem)] overflow-auto rounded-3xl border border-border bg-card/30 shadow-sm">
      <div className="min-w-[78rem]">
        <div className="sticky top-0 z-20 grid grid-cols-[4.5rem_repeat(7,minmax(10.5rem,1fr))] border-b border-border bg-card/95 backdrop-blur">
          <div className="flex items-center px-3 text-[10px] font-semibold text-muted-foreground">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </div>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="border-l border-border px-3 py-3 text-center"
            >
              <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                {format(day, "EEE").toUpperCase()}
              </p>
              <p
                className="mx-auto mt-1 grid size-9 place-items-center rounded-full text-lg font-medium data-[today=true]:bg-primary data-[today=true]:text-primary-foreground"
                data-today={isSameDay(day, new Date()) || undefined}
              >
                {format(day, "d")}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[4.5rem_repeat(7,minmax(10.5rem,1fr))]">
          <div className="relative h-[1536px] border-r border-border bg-card/50">
            {HOURS.map((hour) => (
              <span
                key={hour}
                className="absolute -top-2 right-3 text-[10px] font-medium text-muted-foreground"
                style={{ top: `${hour * 64}px` }}
              >
                {formatHour(hour)}
              </span>
            ))}
          </div>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="relative h-[1536px] border-r border-border last:border-r-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent, transparent 63px, var(--border) 64px)",
              }}
            >
              {HOURS.map((hour) => (
                <button
                  type="button"
                  key={hour}
                  disabled={isPastSlot(day, hour)}
                  className="absolute inset-x-0 h-16 border-b border-transparent text-left outline-none hover:border-primary/20 hover:bg-primary/5 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted/20 disabled:hover:border-transparent disabled:hover:bg-muted/20"
                  style={{ top: `${hour * 64}px` }}
                  aria-label={`Add a lesson on ${format(day, "EEEE, MMMM d")} at ${formatHour(hour)}`}
                  onClick={() => onSlotSelect(createSlotDraft(day, hour))}
                />
              ))}
              {lessons
                .filter((lesson) =>
                  isSameDay(new Date(lesson.scheduledAt), day),
                )
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
  onSlotSelect,
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
  onSlotSelect,
}: CalendarGridProps & {
  days: Date[];
  month: Date;
  onSlotSelect: (draft: { scheduledAt: string; durationMins: number }) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card/30 shadow-sm">
      <div className="grid min-w-[48rem] grid-cols-7 border-b border-border bg-card/95">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <p
            key={day}
            className="px-3 py-3 text-center text-[10px] font-semibold tracking-wide text-muted-foreground"
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
              data-disabled={isPastDay(day) || undefined}
              className="min-h-36 border-r border-b border-border p-3 last:border-r-0 hover:bg-muted/20 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-muted/10 data-[disabled=true]:opacity-45 data-[disabled=true]:hover:bg-muted/10"
              onClick={() => {
                const draft = createMonthlySlotDraft(day);
                if (draft) onSlotSelect(draft);
              }}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(lesson);
                    }}
                    className="block w-full truncate text-left text-[11px] font-medium text-primary hover:underline"
                  >
                    <span className="mr-1 inline-block size-1.5 rounded-full bg-primary" />
                    {formatLessonTime(lesson.scheduledAt)}{" "}
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

function ScheduleList({
  lessons,
  classroomNameById,
  onSelect,
}: CalendarGridProps) {
  const orderedLessons = [...lessons].sort(
    (left, right) =>
      new Date(left.scheduledAt).getTime() -
      new Date(right.scheduledAt).getTime(),
  );

  if (!orderedLessons.length) {
    return (
      <div className="rounded-3xl border border-border bg-card/30 py-20 text-center text-sm text-muted-foreground">
        No lessons in this period.
      </div>
    );
  }

  return (
    <ol className="overflow-hidden rounded-3xl border border-border bg-card/30 shadow-sm">
      {orderedLessons.map((lesson) => {
        const lessonDate = new Date(lesson.scheduledAt);
        return (
          <li
            key={lesson.id}
            className="border-b border-border last:border-b-0"
          >
            <button
              type="button"
              className="grid w-full grid-cols-[4rem_minmax(8rem,11rem)_1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 sm:px-6"
              onClick={() => onSelect(lesson)}
            >
              <div className="text-center">
                <p className="text-xl font-semibold leading-none">
                  {format(lessonDate, "d")}
                </p>
                <p className="mt-1 text-[10px] font-semibold tracking-wide text-muted-foreground">
                  {format(lessonDate, "MMM, EEE").toUpperCase()}
                </p>
              </div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="size-2 rounded-full bg-primary" />
                {formatLessonTime(lesson.scheduledAt)}
              </p>
              <p className="truncate font-medium">
                {classroomNameById.get(lesson.classroomId) ??
                  "Classroom lesson"}
              </p>
              <LessonStatus status={lesson.status} />
            </button>
          </li>
        );
      })}
    </ol>
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
  const top = Math.max(0, (minutes / 60) * 64);
  const height = Math.max(34, (lesson.durationMins / 60) * 64 - 4);
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(lesson);
      }}
      className="absolute inset-x-1 z-10 overflow-hidden rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-left text-xs hover:bg-primary/15"
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
  const weekStartsOn = 0 as const;
  const start =
    view === "week"
      ? startOfWeek(anchorDate, { weekStartsOn })
      : view === "month"
        ? startOfMonth(anchorDate)
        : startOfDay(anchorDate);
  const end =
    view === "week"
      ? endOfWeek(anchorDate, { weekStartsOn })
      : view === "month"
        ? endOfMonth(anchorDate)
        : addWeeks(start, 8);
  const gridStart = startOfWeek(start, { weekStartsOn });
  const gridEnd = endOfWeek(end, { weekStartsOn });
  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
    label:
      view === "week"
        ? `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
        : view === "month"
          ? format(anchorDate, "MMMM yyyy")
          : `Upcoming schedule · ${format(start, "MMM d")} – ${format(end, "MMM d")}`,
    days: eachDayOfInterval({ start: gridStart, end: gridEnd }),
  };
}

function formatHour(hour: number) {
  return format(new Date(2024, 0, 1, hour), "h a");
}

function createSlotDraft(day: Date, hour: number) {
  const scheduledAt = new Date(day);
  scheduledAt.setHours(hour, 0, 0, 0);
  return { scheduledAt: scheduledAt.toISOString(), durationMins: 60 };
}

function createMonthlySlotDraft(day: Date) {
  if (isPastDay(day)) return null;
  const now = new Date();
  const hour = isSameDay(day, now) ? now.getHours() + 1 : 9;
  if (hour > 23) return null;
  const draft = createSlotDraft(day, hour);
  return new Date(draft.scheduledAt).getTime() > now.getTime() ? draft : null;
}

function isPastSlot(day: Date, hour: number) {
  return (
    new Date(createSlotDraft(day, hour).scheduledAt).getTime() <= Date.now()
  );
}

function isPastDay(day: Date) {
  const endOfDay = new Date(day);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() <= Date.now();
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function FilterGroup({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </legend>
      <div className={`grid gap-2 ${className ?? ""}`}>{children}</div>
    </fieldset>
  );
}

function FilterOption({
  checked,
  onCheckedChange,
  children,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/70">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <span className="min-w-0 truncate">{children}</span>
    </label>
  );
}

function formatLessonTime(value: string) {
  return format(new Date(value), "h:mm a");
}
function formatLessonDate(value: string) {
  return format(new Date(value), "EEE, MMM d");
}
