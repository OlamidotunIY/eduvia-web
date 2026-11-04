import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { OrganizationSubject } from "@/shared/domain";

const createClassroomSchema = z.object({
  name: z.string().trim().min(2, "Enter a classroom name."),
  subjectId: z.string().min(1, "Choose a subject."),
  lessonDurationMins: z.coerce
    .number()
    .int()
    .min(15, "Lesson duration must be at least 15 minutes.")
    .max(480, "Lesson duration cannot exceed 480 minutes."),
  // z.preprocess runs before type-checking, so the form field can hold an
  // empty string while the validated output is number | undefined.
  // This avoids the input/output type mismatch that breaks zodResolver.
  maxStudents: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z.number().int().positive("Capacity must be greater than zero.").optional(),
  ),
  recurrenceDayOfWeek: z.coerce.number().int().min(0).max(6),
  recurrenceStartTime: z.string().regex(/^\d{2}:\d{2}$/, "Enter a valid time."),
  recurrenceIntervalWeeks: z.coerce.number().int().min(1).max(12),
  recurrenceEffectiveFrom: z.string().min(1, "Choose a start date."),
});

type CreateClassroomForm = z.infer<typeof createClassroomSchema>;

interface CreateClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: OrganizationSubject[];
  isSubmitting: boolean;
  error?: Error | null;
  onSubmit: (input: CreateClassroomForm) => void;
}

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function CreateClassroomDialog({
  open,
  onOpenChange,
  subjects,
  isSubmitting,
  error,
  onSubmit,
}: CreateClassroomDialogProps) {
  const form = useForm<CreateClassroomForm>({
    resolver: zodResolver(createClassroomSchema),
    defaultValues: {
      name: "",
      subjectId: "",
      lessonDurationMins: 60,
      maxStudents: undefined,
      recurrenceDayOfWeek: 1,
      recurrenceStartTime: "09:00",
      recurrenceIntervalWeeks: 1,
      recurrenceEffectiveFrom: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [form, open]);

  const submit = form.handleSubmit((value) => onSubmit(value));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create classroom</DialogTitle>
          <DialogDescription>
            Set up the classroom’s recurring lesson schedule. You can add
            learners and schedule individual lessons afterwards.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-5" onSubmit={submit}>
          <FormField
            label="Classroom name"
            error={form.formState.errors.name?.message}
          >
            <Input
              autoFocus
              placeholder="e.g. Grade 7 Mathematics"
              {...form.register("name")}
            />
          </FormField>
          <FormField
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
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Lesson duration (minutes)"
              error={form.formState.errors.lessonDurationMins?.message}
            >
              <Input
                type="number"
                min="15"
                step="15"
                {...form.register("lessonDurationMins")}
              />
            </FormField>
            <FormField
              label="Learner capacity"
              hint="Optional"
              error={form.formState.errors.maxStudents?.message}
            >
              <Input
                type="number"
                min="1"
                placeholder="No limit"
                {...form.register("maxStudents")}
              />
            </FormField>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Repeats on"
              error={form.formState.errors.recurrenceDayOfWeek?.message}
            >
              <Select
                value={String(form.watch("recurrenceDayOfWeek"))}
                onValueChange={(value) =>
                  form.setValue("recurrenceDayOfWeek", Number(value), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day, index) => (
                    <SelectItem key={day} value={String(index)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              label="Start time"
              error={form.formState.errors.recurrenceStartTime?.message}
            >
              <Input type="time" {...form.register("recurrenceStartTime")} />
            </FormField>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Frequency"
              error={form.formState.errors.recurrenceIntervalWeeks?.message}
            >
              <Input
                type="number"
                min="1"
                max="12"
                {...form.register("recurrenceIntervalWeeks")}
              />
            </FormField>
            <FormField
              label="Starts on"
              error={form.formState.errors.recurrenceEffectiveFrom?.message}
            >
              <Input
                type="date"
                {...form.register("recurrenceEffectiveFrom")}
              />
            </FormField>
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

function FormField({
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
