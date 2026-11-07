import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type LessonScheduleInput = {
  scheduledAt: string;
  durationMins: number;
};

export function ScheduleLessonDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  mode = "extra",
  initialLesson,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: LessonScheduleInput) => void;
  isSubmitting: boolean;
  mode?: "extra" | "reschedule";
  initialLesson?: { scheduledAt: string; durationMins: number } | null;
}) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [durationMins, setDurationMins] = useState("60");
  const isReschedule = mode === "reschedule";
  const times = useMemo(() => createTimeOptions(), []);
  const availableTimes = useMemo(
    () =>
      date
        ? times.filter((option) => isFutureDateTime(date, option.value))
        : times,
    [date, times],
  );
  const isPastSelection = Boolean(date && !isFutureDateTime(date, time));

  useEffect(() => {
    if (!open) return;
    if (initialLesson) {
      const scheduledAt = new Date(initialLesson.scheduledAt);
      setDate(scheduledAt);
      setTime(
        `${String(scheduledAt.getHours()).padStart(2, "0")}:${String(
          scheduledAt.getMinutes(),
        ).padStart(2, "0")}`,
      );
      setDurationMins(String(initialLesson.durationMins));
      return;
    }
    setDate(undefined);
    setTime("09:00");
    setDurationMins("60");
  }, [initialLesson, open]);

  useEffect(() => {
    if (!date || availableTimes.some((option) => option.value === time)) return;
    setTime(availableTimes[0]?.value ?? "");
  }, [availableTimes, date, time]);

  const title = isReschedule ? "Reschedule lesson" : "Add extra lesson";
  const description = isReschedule
    ? "Choose the new date, time, and optional duration for this lesson."
    : "Add a one-off lesson outside this classroom’s recurring schedule.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(46rem,calc(100dvh-2rem))] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!date || isPastSelection) return;
            onSubmit({
              scheduledAt: toLocalIso(date, time),
              durationMins: Number(durationMins),
            });
          }}
        >
          <div className="grid gap-3">
            <Label>Lesson date</Label>
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarDays />
                    {date ? formatDate(date) : "Choose a lesson date"}
                  </Button>
                }
              />
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={{ before: startOfToday() }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Start time</Label>
              <Select
                value={time}
                onValueChange={(value) => setTime(value ?? "09:00")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Duration</Label>
              <Select
                value={durationMins}
                onValueChange={(value) => setDurationMins(value ?? "60")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[30, 45, 60, 75, 90, 120].map((minutes) => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {minutes} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {isPastSelection ? (
            <p className="text-sm text-destructive">
              Choose a future start time for this lesson.
            </p>
          ) : null}
          <DialogFooter showCloseButton>
            <Button
              type="submit"
              disabled={
                !date ||
                !availableTimes.length ||
                isPastSelection ||
                isSubmitting
              }
            >
              {isSubmitting ? "Saving…" : title}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function toLocalIso(date: Date, time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
  ).toISOString();
}

function isFutureDateTime(date: Date, time: string): boolean {
  return new Date(toLocalIso(date, time)).getTime() > Date.now();
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function createTimeOptions() {
  return Array.from({ length: 48 }, (_, index) => {
    const hours = Math.floor(index / 2);
    const minutes = index % 2 === 0 ? 0 : 30;
    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(2024, 0, 1, hours, minutes));
    return { value, label };
  });
}

export function AddLearnerDialog({
  open,
  onOpenChange,
  learners,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learners: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  onSubmit: (id: string) => void;
  isSubmitting: boolean;
}) {
  const [learnerId, setLearnerId] = useState("");
  const selectedLearner = learners.find((learner) => learner.id === learnerId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add learner</DialogTitle>
          <DialogDescription>
            Choose an eligible learner from this organization.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(learnerId);
          }}
        >
          <div className="grid gap-2">
            <Label>Learner</Label>
            <Select
              value={learnerId || undefined}
              onValueChange={(value) => setLearnerId(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <span
                  className={
                    selectedLearner
                      ? "flex-1 truncate text-left"
                      : "flex-1 text-left text-muted-foreground"
                  }
                >
                  {selectedLearner
                    ? `${selectedLearner.firstName} ${selectedLearner.lastName} · ${selectedLearner.email}`
                    : "Select a learner"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {learners.map((learner) => (
                  <SelectItem key={learner.id} value={learner.id}>
                    {learner.firstName} {learner.lastName} · {learner.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!learners.length ? (
              <p className="text-xs text-muted-foreground">
                No eligible learners are available.
              </p>
            ) : null}
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={!learnerId || isSubmitting}>
              {isSubmitting ? "Adding…" : "Add learner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
