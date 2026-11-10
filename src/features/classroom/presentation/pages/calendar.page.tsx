import { useMemo, useState, useRef, useEffect, type ReactNode } from "react";
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
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Funnel,
  RotateCcw,
} from "lucide-react";
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
const SLOT_HEIGHT = 56;
const WEEK_GRID_HEIGHT = HOURS.length * SLOT_HEIGHT;

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
    <section className="-m-4 flex min-h-0 flex-1 flex-col overflow-hidden md:-m-6">
      {/* Calendar Dedicated Top Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/80 bg-background/95 px-4 py-2.5 backdrop-blur-xs gap-2 z-10">
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-8"
            onClick={() => movePeriod(-1)}
            aria-label="Previous period"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="h-8 px-2.5 text-xs font-semibold"
            onClick={goToToday}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-8"
            onClick={() => movePeriod(1)}
            aria-label="Next period"
          >
            <ChevronRight className="size-4" />
          </Button>
          <p className="ml-2 font-heading text-sm sm:text-base font-semibold text-foreground whitespace-nowrap">
            {range.label}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-xs"
                  className="relative shrink-0 size-8"
                  aria-label="Filter calendar"
                  title="Filter calendar"
                >
                  <Funnel className="size-3.5" />
                  {activeFilterCount ? (
                    <span className="absolute -right-1 -top-1 grid size-3.5 place-items-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
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

          {/* Mobile View Switcher (Select Dropdown) */}
          <div className="sm:hidden">
            <Select
              value={view}
              onValueChange={(val) => {
                if (val) setView(val as CalendarView);
              }}
            >
              <SelectTrigger
                size="sm"
                className="h-8 w-24 px-2 text-xs font-medium"
              >
                <span className="capitalize">{view}</span>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="schedule">Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop View Switcher (Segmented buttons) */}
          <div className="hidden sm:flex items-center rounded-lg border border-border p-0.5">
            <Button
              size="sm"
              variant={view === "week" ? "secondary" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => setView("week")}
            >
              Week
            </Button>
            <Button
              size="sm"
              variant={view === "month" ? "secondary" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => setView("month")}
            >
              Month
            </Button>
            <Button
              size="sm"
              variant={view === "schedule" ? "secondary" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => setView("schedule")}
            >
              Schedule
            </Button>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1">
          {lessons.isPending ? (
            <p className="py-20 text-center text-sm text-muted-foreground">
              Loading lessons…
            </p>
          ) : view === "week" ? (
            <>
              <div className="hidden h-full min-h-0 lg:block">
                <WeekGrid
                  days={range.days}
                  lessons={visibleLessons}
                  classroomNameById={classroomNameById}
                  onSelect={setSelectedLesson}
                  onSlotSelect={openScheduleChoice}
                />
              </div>
              <div className="h-full min-h-0 overflow-hidden lg:hidden">
                <MobileDayView
                  days={range.days}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  lessons={visibleLessons}
                  classroomNameById={classroomNameById}
                  onSelect={setSelectedLesson}
                  onSlotSelect={openScheduleChoice}
                  canSchedule={canSchedule}
                />
              </div>
            </>
          ) : view === "month" ? (
            <MonthGrid
              days={range.days}
              month={anchorDate}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              lessons={visibleLessons}
              classroomNameById={classroomNameById}
              onSelect={setSelectedLesson}
              onSlotSelect={openScheduleChoice}
              canSchedule={canSchedule}
            />
          ) : (
            <div className="h-full overflow-y-auto">
              <ScheduleList
                lessons={visibleLessons}
                classroomNameById={classroomNameById}
                onSelect={setSelectedLesson}
              />
            </div>
          )}
        </div>

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
            createClassroom.mutate(
              {
                ...input,
                primaryTeacherId: currentUser!.user.id,
                recurrenceTimezone:
                  Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              {
                onSuccess: () => setRecurringScheduleDraft(null),
              },
            )
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
    <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden">
      <div className="min-w-0">
        <div className="grid grid-cols-[5rem_repeat(7,minmax(0,1fr))] border-b border-border">
          <div className="flex h-[4.5rem] items-end justify-end px-3 pb-2 text-[10px] font-medium text-muted-foreground">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </div>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="flex h-[4.5rem] flex-col items-center justify-center border-l border-border px-3 text-center"
            >
              <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">
                {format(day, "EEE").toUpperCase()}
              </p>
              <p
                className="mt-1 grid size-8 place-items-center rounded-full text-base font-semibold data-[today=true]:bg-primary data-[today=true]:text-primary-foreground"
                data-today={isSameDay(day, new Date()) || undefined}
              >
                {format(day, "d")}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[5rem_repeat(7,minmax(0,1fr))]">
          <div
            className="relative border-r border-border"
            style={{ height: `${WEEK_GRID_HEIGHT}px` }}
          >
            {HOURS.map((hour) => (
              <span
                key={hour}
                className="absolute right-3 translate-y-1 text-[10px] font-medium text-muted-foreground"
                style={{ top: `${hour * SLOT_HEIGHT}px` }}
              >
                {formatHour(hour)}
              </span>
            ))}
          </div>
          {days.map((day) => {
            const dayLessons = lessons.filter((lesson) =>
              isSameDay(new Date(lesson.scheduledAt), day),
            );

            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-border last:border-r-0"
                style={{
                  height: `${WEEK_GRID_HEIGHT}px`,
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${SLOT_HEIGHT - 1}px, var(--border) ${SLOT_HEIGHT}px)`,
                }}
              >
                {HOURS.map((hour) => {
                  const occupiedLesson = dayLessons.find((lesson) =>
                    doesLessonOccupySlot(lesson, day, hour),
                  );
                  const past = isPastSlot(day, hour);

                  return (
                    <button
                      type="button"
                      key={hour}
                      disabled={past}
                      data-past={past || undefined}
                      data-occupied={Boolean(occupiedLesson) || undefined}
                      className="absolute inset-x-0 border-b border-transparent text-left outline-none hover:bg-primary/5 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring data-[past=true]:cursor-not-allowed data-[past=true]:bg-muted/15 data-[past=true]:hover:bg-muted/15 data-[occupied=true]:cursor-pointer data-[occupied=true]:bg-primary/[0.04] data-[occupied=true]:hover:bg-primary/[0.08]"
                      style={{
                        top: `${hour * SLOT_HEIGHT}px`,
                        height: `${SLOT_HEIGHT}px`,
                      }}
                      aria-label={
                        occupiedLesson
                          ? `View lesson at ${formatHour(hour)} on ${format(day, "EEEE, MMMM d")}`
                          : `Add a lesson on ${format(day, "EEEE, MMMM d")} at ${formatHour(hour)}`
                      }
                      onClick={() =>
                        occupiedLesson
                          ? onSelect(occupiedLesson)
                          : onSlotSelect(createSlotDraft(day, hour))
                      }
                    />
                  );
                })}
                {dayLessons.map((lesson) => (
                  <LessonBlock
                    key={lesson.id}
                    lesson={lesson}
                    classroomName={classroomNameById.get(lesson.classroomId)}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileDayView({
  days,
  selectedDay,
  onSelectDay,
  lessons,
  classroomNameById,
  onSelect,
  onSlotSelect,
  canSchedule,
}: CalendarGridProps & {
  days: Date[];
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  onSlotSelect: (draft: { scheduledAt: string; durationMins: number }) => void;
  canSchedule: boolean;
}) {
  const [mobileMode, setMobileMode] = useState<"timeline" | "agenda">("timeline");
  const scrollRef = useRef<HTMLDivElement>(null);

  const dayLessons = lessons.filter((lesson) =>
    isSameDay(new Date(lesson.scheduledAt), selectedDay),
  );

  const now = new Date();
  const isSelectedDayToday = isSameDay(selectedDay, now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutes / 60) * SLOT_HEIGHT;

  useEffect(() => {
    if (scrollRef.current && mobileMode === "timeline") {
      const earliestHour =
        dayLessons.length > 0
          ? Math.min(...dayLessons.map((l) => new Date(l.scheduledAt).getHours()))
          : isSelectedDayToday
            ? Math.max(0, now.getHours() - 1)
            : 8;
      const targetHour = Math.max(0, Math.min(23, earliestHour - 1));
      scrollRef.current.scrollTop = targetHour * SLOT_HEIGHT;
    }
  }, [selectedDay, mobileMode]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 7-Day Header Strip */}
      <div className="border-b border-border bg-card/40 px-2 py-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-foreground">
            {format(selectedDay, "EEEE, MMMM d")}
          </p>
          <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/20">
            <Button
              size="icon-xs"
              variant={mobileMode === "timeline" ? "secondary" : "ghost"}
              onClick={() => setMobileMode("timeline")}
              title="Timeline view"
              aria-label="Timeline view"
            >
              <Clock3 className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant={mobileMode === "agenda" ? "secondary" : "ghost"}
              onClick={() => setMobileMode("agenda")}
              title="List view"
              aria-label="List view"
            >
              <CalendarDays className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDay);
            const isToday = isSameDay(day, now);
            const hasLessons = lessons.some((l) =>
              isSameDay(new Date(l.scheduledAt), day),
            );

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelectDay(day)}
                className={`relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : isToday
                      ? "border border-primary/50 text-foreground font-medium"
                      : "text-foreground hover:bg-muted/30"
                }`}
              >
                <span
                  className={`text-[10px] uppercase tracking-wider ${
                    isSelected
                      ? "text-primary-foreground/90 font-bold"
                      : "text-muted-foreground font-medium"
                  }`}
                >
                  {format(day, "EEE")}
                </span>
                <span className="mt-0.5 text-sm font-semibold">
                  {format(day, "d")}
                </span>
                <div className="mt-0.5 flex h-1 items-center justify-center">
                  {hasLessons && (
                    <span
                      className={`size-1.5 rounded-full ${
                        isSelected ? "bg-primary-foreground" : "bg-emerald-400"
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {mobileMode === "timeline" ? (
        <div ref={scrollRef} className="h-full min-h-0 flex-1 overflow-y-auto">
          <div className="relative grid grid-cols-[3.5rem_1fr]">
            {/* Time labels column */}
            <div
              className="relative border-r border-border"
              style={{ height: `${WEEK_GRID_HEIGHT}px` }}
            >
              {HOURS.map((hour) => (
                <span
                  key={hour}
                  className="absolute right-2 translate-y-1 text-[10px] font-medium text-muted-foreground"
                  style={{ top: `${hour * SLOT_HEIGHT}px` }}
                >
                  {formatHour(hour)}
                </span>
              ))}
            </div>

            {/* Single day column with hourly slots */}
            <div
              className="relative"
              style={{
                height: `${WEEK_GRID_HEIGHT}px`,
                backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${SLOT_HEIGHT - 1}px, var(--border) ${SLOT_HEIGHT}px)`,
              }}
            >
              {isSelectedDayToday && (
                <div
                  className="absolute inset-x-0 z-20 pointer-events-none flex items-center"
                  style={{ top: `${currentTimeTop}px` }}
                >
                  <span className="size-2 rounded-full bg-rose-500 -ml-1" />
                  <div className="h-0.5 w-full bg-rose-500/80" />
                </div>
              )}

              {HOURS.map((hour) => {
                const occupiedLesson = dayLessons.find((lesson) =>
                  doesLessonOccupySlot(lesson, selectedDay, hour),
                );
                const past = isPastSlot(selectedDay, hour);

                return (
                  <button
                    type="button"
                    key={hour}
                    disabled={past}
                    data-past={past || undefined}
                    data-occupied={Boolean(occupiedLesson) || undefined}
                    className="absolute inset-x-0 border-b border-transparent text-left outline-none hover:bg-primary/5 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring data-[past=true]:cursor-not-allowed data-[past=true]:bg-muted/15 data-[past=true]:hover:bg-muted/15 data-[occupied=true]:cursor-pointer data-[occupied=true]:bg-primary/[0.04] data-[occupied=true]:hover:bg-primary/[0.08]"
                    style={{
                      top: `${hour * SLOT_HEIGHT}px`,
                      height: `${SLOT_HEIGHT}px`,
                    }}
                    aria-label={
                      occupiedLesson
                        ? `View lesson at ${formatHour(hour)}`
                        : `Add a lesson at ${formatHour(hour)}`
                    }
                    onClick={() =>
                      occupiedLesson
                        ? onSelect(occupiedLesson)
                        : onSlotSelect(createSlotDraft(selectedDay, hour))
                    }
                  />
                );
              })}

              {dayLessons.map((lesson) => (
                <LessonBlock
                  key={lesson.id}
                  lesson={lesson}
                  classroomName={classroomNameById.get(lesson.classroomId)}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full min-h-0 flex-1 overflow-y-auto p-4">
          <AgendaList
            lessons={dayLessons}
            classroomNameById={classroomNameById}
            onSelect={onSelect}
          />
          {canSchedule && (
            <div className="mt-6 flex justify-center pb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const draft = getSlotDraftForDay(selectedDay);
                  onSlotSelect(draft);
                }}
              >
                + Schedule lesson on {format(selectedDay, "MMM d")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MonthGrid({
  days,
  month,
  selectedDay,
  onSelectDay,
  lessons,
  classroomNameById,
  onSelect,
  onSlotSelect,
  canSchedule,
}: CalendarGridProps & {
  days: Date[];
  month: Date;
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  onSlotSelect: (draft: { scheduledAt: string; durationMins: number }) => void;
  canSchedule?: boolean;
}) {
  const selectedDayLessons = lessons.filter((lesson) =>
    isSameDay(new Date(lesson.scheduledAt), selectedDay),
  );

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* Desktop view (lg+) */}
      <div className="hidden lg:block h-full overflow-y-auto">
        <div className="grid min-w-0 grid-cols-7 border-b border-border bg-transparent">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <p
              key={day}
              className="px-3 py-3 text-center text-[10px] font-semibold tracking-wide text-muted-foreground"
            >
              {day}
            </p>
          ))}
        </div>
        <div className="grid min-w-0 grid-cols-7">
          {days.map((day) => {
            const dayLessons = lessons.filter((lesson) =>
              isSameDay(new Date(lesson.scheduledAt), day),
            );
            return (
              <div
                key={day.toISOString()}
                data-disabled={isPastDay(day) || undefined}
                className="min-h-36 border-r border-b border-border p-3 last:border-r-0 hover:bg-muted/20 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-muted/10 data-[disabled=true]:opacity-45 data-[disabled=true]:hover:bg-muted/10 cursor-pointer"
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
                      className="block w-full truncate text-left text-[11px] font-medium text-primary hover:underline cursor-pointer"
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

      {/* Mobile view (< lg) */}
      <div className="lg:hidden h-full min-h-0 overflow-y-auto flex flex-col divide-y divide-border">
        {/* Compact 7-column Calendar */}
        <div className="p-3 bg-card/20">
          <div className="grid grid-cols-7 text-center pb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span
                key={i}
                className="text-[11px] font-semibold text-muted-foreground"
              >
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayLessons = lessons.filter((lesson) =>
                isSameDay(new Date(lesson.scheduledAt), day),
              );
              const isSelected = isSameDay(day, selectedDay);
              const isToday = isSameDay(day, new Date());
              const inCurrentMonth = isSameMonth(day, month);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => onSelectDay(day)}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs relative transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : isToday
                        ? "border border-primary/50 text-foreground font-medium"
                        : inCurrentMonth
                          ? "text-foreground hover:bg-muted/30"
                          : "text-muted-foreground/40 hover:bg-muted/10"
                  }`}
                >
                  <span>{format(day, "d")}</span>
                  <div className="flex gap-0.5 mt-1 h-1 items-center justify-center">
                    {dayLessons.slice(0, 3).map((_, i) => (
                      <span
                        key={i}
                        className={`size-1 rounded-full ${
                          isSelected ? "bg-primary-foreground" : "bg-emerald-400"
                        }`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Detail */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between pb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {format(selectedDay, "EEEE, MMMM d")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedDayLessons.length === 0
                  ? "No lessons scheduled"
                  : `${selectedDayLessons.length} lesson${selectedDayLessons.length > 1 ? "s" : ""}`}
              </p>
            </div>
            {canSchedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const draft = getSlotDraftForDay(selectedDay);
                  onSlotSelect(draft);
                }}
              >
                + Add lesson
              </Button>
            )}
          </div>

          <AgendaList
            lessons={selectedDayLessons}
            classroomNameById={classroomNameById}
            onSelect={onSelect}
          />
        </div>
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
      <div className="py-20 text-center text-sm text-muted-foreground">
        No lessons in this period.
      </div>
    );
  }

  return (
    <ol className="divide-y divide-border">
      {orderedLessons.map((lesson) => {
        const lessonDate = new Date(lesson.scheduledAt);
        return (
          <li key={lesson.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors sm:px-6"
              onClick={() => onSelect(lesson)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-center w-10 shrink-0">
                  <p className="text-lg font-semibold leading-none">
                    {format(lessonDate, "d")}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold tracking-wide text-muted-foreground">
                    {format(lessonDate, "MMM").toUpperCase()}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {classroomNameById.get(lesson.classroomId) ??
                      "Classroom lesson"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="size-3" />
                    <span>
                      {format(lessonDate, "EEE")} ·{" "}
                      {formatLessonTime(lesson.scheduledAt)}
                    </span>
                    <span>·</span>
                    <span>{lesson.durationMins} min</span>
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <LessonStatus status={lesson.status} />
              </div>
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
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No lessons scheduled
        </p>
      </div>
    );
  return (
    <ol className="divide-y divide-border">
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 py-3.5 text-left hover:bg-muted/30 transition-colors rounded-lg px-2"
            onClick={() => onSelect(lesson)}
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground truncate">
                {classroomNameById.get(lesson.classroomId) ??
                  "Classroom lesson"}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="size-3.5 shrink-0" />
                <span>{formatLessonTime(lesson.scheduledAt)}</span>
                <span>·</span>
                <span>{lesson.durationMins} min</span>
              </p>
            </div>
            <div className="shrink-0">
              <LessonStatus status={lesson.status} />
            </div>
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
  const top = Math.max(0, (minutes / 60) * SLOT_HEIGHT);
  const height = Math.max(34, (lesson.durationMins / 60) * SLOT_HEIGHT - 4);
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

function getSlotDraftForDay(day: Date) {
  const draft = createMonthlySlotDraft(day);
  if (draft) return draft;
  return createSlotDraft(day, 9);
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

function doesLessonOccupySlot(
  lesson: ClassroomLesson,
  day: Date,
  hour: number,
) {
  if (lesson.status.toLowerCase() === "cancelled") return false;

  const slotStart = new Date(day);
  slotStart.setHours(hour, 0, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
  const lessonStart = new Date(lesson.scheduledAt);
  const lessonEnd = new Date(
    lessonStart.getTime() + lesson.durationMins * 60 * 1000,
  );

  return lessonStart < slotEnd && lessonEnd > slotStart;
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
