import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import {
  AlertCircle,
  CalendarDays,
  FilePlus2,
  Loader2,
  Star,
} from "lucide-react";
import { useCreateReportMutation } from "../../application";
import type {
  MissingReportLessonItem,
  ReportAttendanceStatus,
} from "@/shared/domain";

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  preselectedLesson?: MissingReportLessonItem | null;
  availableLessons: MissingReportLessonItem[];
  onReportCreated?: (reportId: string) => void;
}

export function CreateReportDialog({
  open,
  onOpenChange,
  orgId,
  preselectedLesson,
  availableLessons,
  onReportCreated,
}: CreateReportDialogProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [attendanceStatus, setAttendanceStatus] =
    useState<ReportAttendanceStatus>("attended");
  const [overallRating, setOverallRating] = useState<number>(5);
  const [teacherNarrative, setTeacherNarrative] = useState<string>("");
  const [homeworkSet, setHomeworkSet] = useState<string>("");
  const [nextSteps, setNextSteps] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateReportMutation(orgId);

  const selectedLesson = useMemo(() => {
    if (preselectedLesson && selectedLessonId === preselectedLesson.lessonId) {
      return preselectedLesson;
    }
    return (
      availableLessons.find((l) => l.lessonId === selectedLessonId) ?? null
    );
  }, [availableLessons, preselectedLesson, selectedLessonId]);

  useEffect(() => {
    if (!open) return;
    setErrorMessage(null);

    if (preselectedLesson) {
      setSelectedLessonId(preselectedLesson.lessonId);
      setSelectedStudentId(preselectedLesson.students[0]?.id ?? "");
    } else if (availableLessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(availableLessons[0].lessonId);
      setSelectedStudentId(availableLessons[0].students[0]?.id ?? "");
    } else {
      setSelectedLessonId("");
      setSelectedStudentId("");
    }
    setAttendanceStatus("attended");
    setOverallRating(5);
    setTeacherNarrative("");
    setHomeworkSet("");
    setNextSteps("");
  }, [open, preselectedLesson, availableLessons]);

  const handleLessonChange = (lessonId: string | null) => {
    const id = lessonId ?? "";
    setSelectedLessonId(id);
    const found = availableLessons.find((l) => l.lessonId === id);
    setSelectedStudentId(found?.students[0]?.id ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson || !selectedStudentId) {
      setErrorMessage("Please select a past lesson and a learner.");
      return;
    }

    setErrorMessage(null);
    try {
      const result = await createMutation.mutateAsync({
        lessonId: selectedLesson.lessonId,
        classroomId: selectedLesson.classroomId,
        teacherId: selectedLesson.teacherId,
        studentId: selectedStudentId,
        attendanceStatus,
        overallRating,
        teacherNarrative: teacherNarrative.trim() || undefined,
        homeworkSet: homeworkSet.trim() || undefined,
        nextSteps: nextSteps.trim() || undefined,
      });
      onOpenChange(false);
      onReportCreated?.(result.reportId);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to create lesson report draft.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <FilePlus2 className="size-4" />
            <DialogTitle>Draft Lesson Report</DialogTitle>
          </div>
          <DialogDescription>
            Pick any past completed lesson to initialize a lesson report draft. You can continue editing or approve an AI summary right after.
          </DialogDescription>
        </DialogHeader>

        {availableLessons.length === 0 && !preselectedLesson ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-6 text-center space-y-2">
            <CalendarDays className="size-8 text-muted-foreground/60 mx-auto" />
            <p className="text-sm font-medium text-foreground">
              No unreported past lessons found
            </p>
            <p className="text-xs text-muted-foreground">
              All past completed lessons already have reports associated with them.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Lesson Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Completed Lesson</Label>
              <Select
                value={selectedLessonId}
                onValueChange={handleLessonChange}
              >
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue placeholder="Choose a completed lesson..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLessons.map((l) => {
                    const dateFormatted = new Date(
                      l.scheduledAt,
                    ).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    return (
                      <SelectItem
                        key={l.lessonId}
                        value={l.lessonId}
                        className="text-xs"
                      >
                        {l.classroomName} · {dateFormatted} ({l.teacherName})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedLesson && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] font-normal">
                    Subject: {selectedLesson.subjectName}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    Teacher: {selectedLesson.teacherName}
                  </Badge>
                </div>
              )}
            </div>

            {/* Learner Picker */}
            {selectedLesson && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Learner</Label>
                {selectedLesson.students.length === 0 ? (
                  <Alert variant="destructive" className="py-2 text-xs">
                    <AlertCircle className="size-3.5" />
                    <AlertDescription>
                      No active learners enrolled in this classroom.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Select
                    value={selectedStudentId}
                    onValueChange={(v) => setSelectedStudentId(v ?? "")}
                  >
                    <SelectTrigger className="w-full text-xs h-9">
                      <SelectValue placeholder="Choose learner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedLesson.students.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={s.id}
                          className="text-xs"
                        >
                          {s.firstName} {s.lastName} ({s.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Attendance & Overall Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Attendance</Label>
                <Select
                  value={attendanceStatus}
                  onValueChange={(val) =>
                    setAttendanceStatus((val as ReportAttendanceStatus) ?? "attended")
                  }
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attended" className="text-xs">
                      Attended
                    </SelectItem>
                    <SelectItem value="late" className="text-xs">
                      Late
                    </SelectItem>
                    <SelectItem value="absent" className="text-xs">
                      Absent
                    </SelectItem>
                    <SelectItem value="no_show" className="text-xs">
                      No Show
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Lesson Rating</Label>
                <div className="flex items-center gap-1 h-9 px-2 rounded-md border border-input bg-transparent">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      className="p-0.5 transition-transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`size-4 ${
                          star <= overallRating
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-medium text-muted-foreground">
                    {overallRating}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Teacher Narrative */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Teacher Observations (Optional)
              </Label>
              <Textarea
                value={teacherNarrative}
                onChange={(e) => setTeacherNarrative(e.target.value)}
                placeholder="Notes on student comprehension, strengths, or areas needing practice..."
                className="text-xs min-h-[80px] resize-none"
              />
            </div>

            {/* Homework & Next Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Homework Set (Optional)
                </Label>
                <Textarea
                  value={homeworkSet}
                  onChange={(e) => setHomeworkSet(e.target.value)}
                  placeholder="Practice problems or reading..."
                  className="text-xs min-h-[64px] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Next Steps (Optional)
                </Label>
                <Textarea
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  placeholder="Focus topics for next session..."
                  className="text-xs min-h-[64px] resize-none"
                />
              </div>
            </div>

            {errorMessage && (
              <Alert variant="destructive" className="py-2 text-xs">
                <AlertCircle className="size-3.5" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  createMutation.isPending ||
                  !selectedLesson ||
                  !selectedStudentId
                }
                className="gap-1.5"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Creating Draft...
                  </>
                ) : (
                  "Create Draft"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
