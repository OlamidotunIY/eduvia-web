import { useState } from "react";
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

export function ScheduleLessonDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    scheduledAt: string;
    durationMins: number;
    isRecurring: boolean;
  }) => void;
  isSubmitting: boolean;
}) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMins, setDurationMins] = useState("60");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule lesson</DialogTitle>
          <DialogDescription>
            Set a date, time, and duration for this classroom.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({
              scheduledAt: new Date(scheduledAt).toISOString(),
              durationMins: Number(durationMins),
              isRecurring: false,
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="lesson-time">Date and time</Label>
            <Input
              id="lesson-time"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              required
            />
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
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={!scheduledAt || isSubmitting}>
              {isSubmitting ? "Scheduling…" : "Schedule lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
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
                <SelectValue placeholder="Select a learner" />
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
