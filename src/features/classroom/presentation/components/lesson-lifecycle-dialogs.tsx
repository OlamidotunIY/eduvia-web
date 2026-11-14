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
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

export function CancelLessonDialog({
  open,
  onOpenChange,
  isSubmitting,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setReason("");
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel lesson</DialogTitle>
          <DialogDescription>
            Provide a short reason so students, parents, and coordinators see
            why this session was cancelled.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="cancel-lesson-reason">Cancellation reason</Label>
          <Textarea
            id="cancel-lesson-reason"
            placeholder="e.g. Teacher unavailable due to scheduling conflict..."
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Keep lesson
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting || reason.trim().length === 0}
            onClick={() => onConfirm(reason.trim())}
          >
            {isSubmitting ? "Cancelling..." : "Cancel lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmLessonActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant = "default",
  isSubmitting,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
  isSubmitting: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            autoFocus={confirmVariant === "destructive"}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={isSubmitting}
            onClick={onConfirm}
            autoFocus={confirmVariant === "default"}
          >
            {isSubmitting ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssignCoverTeacherDialog({
  open,
  onOpenChange,
  teachers,
  currentCoverTeacherId,
  isSubmitting,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teachers: Array<{ id: string; name: string }>;
  currentCoverTeacherId: string | null;
  isSubmitting: boolean;
  onConfirm: (teacherId: string) => void;
}) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );
  const resolvedTeacherId =
    selectedTeacherId ?? currentCoverTeacherId ?? teachers[0]?.id ?? "";

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSelectedTeacherId(null);
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign cover teacher</DialogTitle>
          <DialogDescription>
            Choose another teacher from your organization to lead this lesson.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="cover-teacher-select">Cover teacher</Label>
          <Select
            value={resolvedTeacherId}
            onValueChange={(value) => setSelectedTeacherId(value ?? "")}
          >
            <SelectTrigger id="cover-teacher-select">
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !resolvedTeacherId}
            onClick={() => onConfirm(resolvedTeacherId)}
          >
            {isSubmitting ? "Assigning..." : "Assign cover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
