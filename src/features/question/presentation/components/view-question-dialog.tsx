import { Eye, CheckCircle2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import type { QuestionRecord } from "@/shared/domain";

interface ViewQuestionDialogProps {
  question: QuestionRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewQuestionDialog({
  question,
  open,
  onOpenChange,
}: ViewQuestionDialogProps) {
  if (!question) return null;

  const isPlatform = question.ownerType === "platform";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            <DialogTitle className="font-sans text-xl font-bold">
              Question Details
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Review question stem, metadata, and mark scheme.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={
                isPlatform
                  ? "rounded-full border-muted-foreground/30 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                  : "rounded-full border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              }
            >
              {isPlatform ? "Platform" : "Organization"}
            </Badge>

            <Badge variant="secondary" className="rounded-full text-xs">
              {question.subject}
            </Badge>

            <Badge variant="outline" className="rounded-full text-xs">
              {question.type === "mcq"
                ? "Multiple choice"
                : question.type === "short_answer"
                  ? "Short answer"
                  : "Long answer"}
            </Badge>

            <Badge variant="outline" className="rounded-full text-xs">
              Difficulty: {question.difficultyLevel} / 5
            </Badge>

            <Badge
              variant="outline"
              className={
                question.isPublished
                  ? "rounded-full border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-600 dark:text-emerald-400"
                  : "rounded-full border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              }
            >
              {question.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>

          {/* Stem */}
          <div className="rounded-xl border border-border/70 bg-card/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground">Prompt</p>
            <p className="mt-1 font-sans text-base font-medium text-foreground whitespace-pre-wrap">
              {question.stem}
            </p>
          </div>

          {/* Options for MCQ */}
          {question.type === "mcq" && question.options.length ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground">Options</p>
              <div className="flex flex-col gap-2">
                {question.options.map((opt) => {
                  const isCorrect =
                    question.correctOptionKey &&
                    question.correctOptionKey.toUpperCase() === opt.key.toUpperCase();
                  return (
                    <div
                      key={opt.key}
                      className={`flex items-center justify-between rounded-lg border p-3 text-xs transition-colors ${
                        isCorrect
                          ? "border-emerald-500/40 bg-emerald-500/10 text-foreground font-semibold"
                          : "border-border/70 bg-background/40 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-6 items-center justify-center rounded-md font-bold text-xs ${
                            isCorrect
                              ? "bg-emerald-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isCorrect ? (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="size-3.5" /> Correct answer
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Mark Scheme */}
          {question.markScheme ? (
            <div className="rounded-xl border border-border/70 bg-background/50 p-3.5">
              <p className="text-xs font-semibold text-muted-foreground">Mark Scheme</p>
              <p className="mt-1 text-xs text-foreground whitespace-pre-wrap">
                {question.markScheme}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Max marks: <strong className="text-foreground">{question.maxMarks}</strong>
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
