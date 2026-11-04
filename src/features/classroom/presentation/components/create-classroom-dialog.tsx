import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { OrganizationSubject } from "@/shared/domain";
import { CalendarDays } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a classroom name."),
  subjectId: z.string().min(1, "Choose a subject."),
  lessonDurationMins: z.coerce.number().int().min(15).max(480),
  maxStudents: z.coerce
    .number()
    .int()
    .min(1, "Capacity starts at one learner."),
  recurrenceDaysOfWeek: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Choose at least one day."),
  recurrenceStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Choose a start time."),
  recurrenceEffectiveFrom: z.string().min(1, "Choose a start date."),
  recurrenceEffectiveUntil: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

interface CreateClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: OrganizationSubject[];
  isSubmitting: boolean;
  error?: Error | null;
  onSubmit: (input: FormValues) => void;
}

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const durations = [30, 45, 60, 75, 90, 120, 150, 180];
const times = Array.from({ length: 61 }, (_, index) => {
  const total = 360 + index * 15;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
});

export function CreateClassroomDialog({
  open,
  onOpenChange,
  subjects,
  isSubmitting,
  error,
  onSubmit,
}: CreateClassroomDialogProps) {
  const form = useForm<FormInput, undefined, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      subjectId: "",
      lessonDurationMins: 60,
      maxStudents: 1,
      recurrenceDaysOfWeek: [1],
      recurrenceStartTime: "09:00",
      recurrenceEffectiveFrom: new Date().toISOString().slice(0, 10),
      recurrenceEffectiveUntil: "",
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [form, open]);
  const selectedDays = form.watch("recurrenceDaysOfWeek");
  const submit = form.handleSubmit((value) =>
    onSubmit({
      ...value,
      recurrenceEffectiveUntil: value.recurrenceEffectiveUntil || undefined,
    }),
  );
  const toggleDay = (day: number) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((selected) => selected !== day)
      : [...selectedDays, day].sort((a, b) => a - b);
    form.setValue("recurrenceDaysOfWeek", next, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto p-6 sm:p-8"
        style={{ width: "min(92vw, 64rem)", maxWidth: "none" }}
      >
        <DialogHeader className="max-w-2xl">
          <DialogTitle className="text-xl">Create classroom</DialogTitle>
          <DialogDescription>
            Set up the recurring weekly teaching schedule. You can add learners
            and schedule individual lessons afterwards.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-7" onSubmit={submit}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Classroom name"
              error={form.formState.errors.name?.message}
            >
              <Input
                autoFocus
                placeholder="e.g. Grade 7 Mathematics"
                {...form.register("name")}
              />
            </Field>
            <Field
              label="Subject"
              error={form.formState.errors.subjectId?.message}
            >
              <Select
                value={form.watch("subjectId") || undefined}
                onValueChange={(value) =>
                  form.setValue("subjectId", value ?? "", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <section className="rounded-xl border bg-muted/20 p-4 sm:p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold">Weekly schedule</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose every day this classroom meets. The same start time
                applies to each selected day.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
              <Field
                label="Repeats on"
                error={form.formState.errors.recurrenceDaysOfWeek?.message}
              >
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
                >
                  {weekdays.map((day, index) => (
                    <Button
                      key={day}
                      type="button"
                      variant={
                        selectedDays.includes(index) ? "default" : "outline"
                      }
                      className="h-10 px-1 text-xs"
                      onClick={() => toggleDay(index)}
                      aria-pressed={selectedDays.includes(index)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </Field>
              <Field
                label="Start time"
                error={form.formState.errors.recurrenceStartTime?.message}
              >
                <Select
                  value={form.watch("recurrenceStartTime")}
                  onValueChange={(value) =>
                    form.setValue("recurrenceStartTime", value ?? "", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {times.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Lesson duration"
              hint="60 minutes by default"
              error={form.formState.errors.lessonDurationMins?.message}
            >
              <Select
                value={String(form.watch("lessonDurationMins"))}
                onValueChange={(value) =>
                  form.setValue("lessonDurationMins", Number(value), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration} value={String(duration)}>
                      {formatDuration(duration)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Learner capacity"
              hint="Starts at 1"
              error={form.formState.errors.maxStudents?.message}
            >
              <Input type="number" min="1" {...form.register("maxStudents")} />
            </Field>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Starts on"
              error={form.formState.errors.recurrenceEffectiveFrom?.message}
            >
              <DatePicker
                value={form.watch("recurrenceEffectiveFrom")}
                onChange={(value) =>
                  form.setValue("recurrenceEffectiveFrom", value, {
                    shouldValidate: true,
                  })
                }
              />
            </Field>
            <Field
              label="Ends on"
              hint="Optional — leave empty to continue"
              error={form.formState.errors.recurrenceEffectiveUntil?.message}
            >
              <DatePicker
                value={form.watch("recurrenceEffectiveUntil")}
                minDate={form.watch("recurrenceEffectiveFrom")}
                placeholder="No end date"
                onChange={(value) =>
                  form.setValue("recurrenceEffectiveUntil", value, {
                    shouldValidate: true,
                  })
                }
              />
            </Field>
          </div>
          {error ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          <DialogFooter showCloseButton>
            <Button
              type="submit"
              disabled={isSubmitting || subjects.length === 0}
            >
              {isSubmitting ? "Creating classroom…" : "Create classroom"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function DatePicker({
  value,
  minDate,
  onChange,
  placeholder = "Select a date",
}: {
  value?: string;
  minDate?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const selected = value ? fromDateString(value) : undefined;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start font-normal"
          >
            <CalendarDays className="text-muted-foreground" />
            {selected ? (
              selected.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => date && onChange(toDateString(date))}
          disabled={minDate ? { before: fromDateString(minDate) } : undefined}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2024, 0, 1, hours, minutes));
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function fromDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
