import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type {
  OrganizationSubjectRecord,
  PlatformSubject,
} from "@/shared/domain";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

const CUSTOM_SOURCE = "custom";
const schema = z.object({
  name: z.string().trim().min(2, "Enter a subject name."),
  platformSubjectId: z.string().nullable(),
  description: z.string().trim().max(1000).nullable(),
});

type FormValues = z.output<typeof schema>;

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: OrganizationSubjectRecord | null;
  platformSubjects: PlatformSubject[];
  isSubmitting: boolean;
  error?: Error | null;
  onSubmit: (input: FormValues) => void;
}

export function SubjectDialog({
  open,
  onOpenChange,
  subject,
  platformSubjects,
  isSubmitting,
  error,
  onSubmit,
}: SubjectDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      platformSubjectId: null,
      description: null,
    },
  });
  const platformSubjectId = form.watch("platformSubjectId");
  const selectedPlatformSubject = platformSubjects.find(
    (item) => item.id === platformSubjectId,
  );

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: subject?.name ?? "",
      platformSubjectId: subject?.platformSubjectId ?? null,
      description: subject?.description ?? null,
    });
  }, [form, open, subject]);

  const selectSource = (value: string | null) => {
    const selectedId = value === CUSTOM_SOURCE ? null : value;
    const platformSubject = platformSubjects.find(
      (item) => item.id === selectedId,
    );
    form.setValue("platformSubjectId", selectedId, { shouldValidate: true });
    if (platformSubject && !subject) {
      form.setValue("name", platformSubject.name, { shouldValidate: true });
      form.setValue("description", platformSubject.description, {
        shouldValidate: true,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{subject ? "Edit subject" : "Add subject"}</DialogTitle>
          <DialogDescription>
            {subject
              ? "Update the organization subject without disrupting existing classrooms."
              : "Start from the Eduvia platform catalog or define a subject that belongs only to this organization."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Subject source">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start font-normal"
                  >
                    {selectedPlatformSubject
                      ? `${selectedPlatformSubject.name} · ${selectedPlatformSubject.shortCode}`
                      : "Custom organization subject"}
                  </Button>
                }
              />
              <DropdownMenuContent
                align="start"
                className="max-h-72 w-[var(--anchor-width)] overflow-y-auto"
              >
                <DropdownMenuRadioGroup
                  value={platformSubjectId ?? CUSTOM_SOURCE}
                  onValueChange={selectSource}
                >
                  <DropdownMenuRadioItem value={CUSTOM_SOURCE}>
                    Custom organization subject
                  </DropdownMenuRadioItem>
                  {platformSubjects.map((platformSubject) => (
                    <DropdownMenuRadioItem
                      key={platformSubject.id}
                      value={platformSubject.id}
                    >
                      {platformSubject.name} · {platformSubject.shortCode}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {platformSubjectId
                ? "Linked subjects can later use the shared curriculum catalog."
                : "Custom subjects remain specific to this organization."}
            </p>
          </Field>
          <Field
            label="Subject name"
            error={form.formState.errors.name?.message}
          >
            <Input
              placeholder="e.g. Grade 7 Mathematics"
              {...form.register("name")}
            />
          </Field>
          <Field
            label="Description"
            hint="Optional"
            error={form.formState.errors.description?.message}
          >
            <textarea
              className="min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder="Describe how this subject is taught in your organization."
              value={form.watch("description") ?? ""}
              onChange={(event) =>
                form.setValue("description", event.target.value || null, {
                  shouldValidate: true,
                })
              }
            />
          </Field>
          {error ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving…"
                : subject
                  ? "Save changes"
                  : "Add subject"}
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
