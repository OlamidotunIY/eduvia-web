import { useState } from "react";
import { ClipboardCheck, FileUp, Search } from "lucide-react";
import { useQuestionsQuery } from "@/features/question";
import type {
  BoardQuestion,
  QuestionRecord,
  StudentBoardResponse,
} from "@/shared/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Textarea } from "@/shared/ui/textarea";
import {
  useBoardQuestionResponsesQuery,
  useMarkBoardResponseMutation,
  useMyBoardResponseQuery,
  useSubmitBoardResponseMutation,
} from "../../application";

export function AttachQuestionBankDialog({
  open,
  onOpenChange,
  organizationId,
  attachedQuestionIds,
  isSubmitting,
  onAttach,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  attachedQuestionIds: Set<string>;
  isSubmitting: boolean;
  onAttach: (input: {
    questionId: string;
    mode: "classwork" | "assignment";
    maxMarks: number;
    showOptions: boolean;
  }) => void;
}) {
  const [search, setSearch] = useState("");
  const [attachMode, setAttachMode] = useState<"classwork" | "assignment">(
    "classwork",
  );
  const [showOptions, setShowOptions] = useState(true);
  const questionsQuery = useQuestionsQuery(organizationId, {
    search: search.trim() || undefined,
    take: 25,
  });

  const items: QuestionRecord[] = questionsQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attach question to board</DialogTitle>
          <DialogDescription>
            Choose a question from the bank to pin directly onto the learning
            board.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search questions by stem or subject..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select
            value={attachMode}
            onValueChange={(value) =>
              setAttachMode((value as "classwork" | "assignment") ?? "classwork")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classwork">Classwork</SelectItem>
              <SelectItem value="assignment">Homework / Assignment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={showOptions}
            onCheckedChange={(checked) => setShowOptions(Boolean(checked))}
          />
          <span>Display MCQ answer options directly on the board card</span>
        </label>

        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {questionsQuery.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading Question Bank...
            </p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No questions found in your organization bank.
            </p>
          ) : (
            items.map((q) => {
              const alreadyAttached = attachedQuestionIds.has(q.id);
              return (
                <div
                  key={q.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {q.subject}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {q.maxMarks} marks
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {q.type.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{q.stem}</p>
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    disabled={alreadyAttached || isSubmitting}
                    variant={alreadyAttached ? "outline" : "default"}
                    onClick={() =>
                      onAttach({
                        questionId: q.id,
                        mode: attachMode,
                        maxMarks: q.maxMarks,
                        showOptions,
                      })
                    }
                  >
                    {alreadyAttached ? "Attached" : "Attach"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StudentAnswerDialog({
  open,
  onOpenChange,
  boardId,
  question,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  question: BoardQuestion;
}) {
  const myResponseQuery = useMyBoardResponseQuery(boardId, question.id, open);
  const submitResponse = useSubmitBoardResponseMutation(boardId);
  const existing = myResponseQuery.data;

  const isMcq =
    Boolean(question.question?.options?.length) &&
    question.question?.type === "mcq";

  const responseKey = `${question.id}:${existing?.id ?? "new"}:${existing?.submittedAt ?? ""}:${open ? "1" : "0"}`;
  const [draft, setDraft] = useState<{
    key: string;
    selectedOption: string;
    textContent: string;
    selectedFile: File | null;
  } | null>(null);

  const activeDraft =
    draft && draft.key === responseKey
      ? draft
      : {
          key: responseKey,
          selectedOption: existing?.selectedOption ?? "",
          textContent: existing?.textContent ?? "",
          selectedFile: null,
        };

  const selectedOption = activeDraft.selectedOption;
  const textContent = activeDraft.textContent;
  const selectedFile = activeDraft.selectedFile;

  const updateDraft = (
    patch: Partial<{
      selectedOption: string;
      textContent: string;
      selectedFile: File | null;
    }>,
  ) => {
    setDraft({ ...activeDraft, ...patch });
  };

  const canSubmit =
    (isMcq && Boolean(selectedOption)) ||
    Boolean(textContent.trim()) ||
    Boolean(selectedFile);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const responseType =
      isMcq && selectedOption ? "mcq" : selectedFile ? "image" : "text";

    submitResponse.mutate(
      {
        boardQuestionId: question.id,
        responseType,
        selectedOption: selectedOption || undefined,
        textContent: textContent.trim() || undefined,
        file: selectedFile ?? undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit your answer</DialogTitle>
          <DialogDescription>
            {question.question?.stem ?? "Provide your solution below."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isMcq && question.question?.options ? (
            <div className="space-y-2">
              <Label>Choose an option</Label>
              <div className="space-y-2">
                {question.question.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateDraft({ selectedOption: opt.key })}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      selectedOption === opt.key
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold">
                      {opt.key}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="student-text-answer">
              {isMcq ? "Working / explanation (optional)" : "Written solution"}
            </Label>
            <Textarea
              id="student-text-answer"
              rows={4}
              placeholder="Write your steps or final answer..."
              value={textContent}
              onChange={(event) =>
                updateDraft({ textContent: event.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="student-image-answer">
              Upload photo of handwritten work (optional)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="student-image-answer"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  updateDraft({
                    selectedFile: event.target.files?.[0] ?? null,
                  })
                }
              />
              {selectedFile ? (
                <Badge variant="secondary" className="shrink-0">
                  <FileUp className="mr-1 size-3" /> {selectedFile.name}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={submitResponse.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || submitResponse.isPending}
            onClick={handleSubmit}
          >
            {submitResponse.isPending ? "Submitting..." : "Submit answer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TeacherResponsesSheet({
  open,
  onOpenChange,
  boardId,
  question,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  question: BoardQuestion;
}) {
  const responsesQuery = useBoardQuestionResponsesQuery(
    boardId,
    question.id,
    open,
  );
  const markResponse = useMarkBoardResponseMutation(boardId);
  const [markingResponse, setMarkingResponse] =
    useState<StudentBoardResponse | null>(null);
  const [marksAwarded, setMarksAwarded] = useState("");
  const [feedback, setFeedback] = useState("");

  const openMarkDialog = (resp: StudentBoardResponse) => {
    const currentMarks =
      resp.teacherMark?.marksAwarded ?? resp.autoMarkResult?.marksAwarded ?? 0;
    setMarksAwarded(String(currentMarks));
    setFeedback(resp.teacherMark?.feedback ?? "");
    setMarkingResponse(resp);
  };

  const responses = responsesQuery.data ?? [];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Student responses</SheetTitle>
            <SheetDescription>
              {question.question?.stem ?? `Question #${question.questionId}`} ·{" "}
              {question.maxMarks} max marks
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 p-4">
            {responsesQuery.isLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Loading student responses...
              </p>
            ) : responses.length === 0 ? (
              <Empty className="border border-dashed py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ClipboardCheck className="size-4" />
                  </EmptyMedia>
                  <EmptyTitle>No responses yet</EmptyTitle>
                  <EmptyDescription>
                    Student answers will appear here as soon as they submit.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              responses.map((resp) => {
                const award =
                  resp.teacherMark?.marksAwarded ??
                  resp.autoMarkResult?.marksAwarded ??
                  null;
                return (
                  <Card key={resp.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm">
                            {resp.studentName ||
                              `Student ${resp.studentId.slice(0, 8)}`}
                          </CardTitle>
                          {resp.studentEmail ? (
                            <CardDescription className="text-xs">
                              {resp.studentEmail}
                            </CardDescription>
                          ) : null}
                        </div>
                        <Badge
                          variant={award !== null ? "default" : "outline"}
                          className="text-xs tabular-nums"
                        >
                          {award !== null
                            ? `${award}/${resp.teacherMark?.maxMarks ?? question.maxMarks}`
                            : "Unmarked"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {resp.selectedOption ? (
                        <p className="font-medium">
                          Option selected: {resp.selectedOption}
                        </p>
                      ) : null}
                      {resp.textContent ? (
                        <p className="whitespace-pre-line">
                          {resp.textContent}
                        </p>
                      ) : null}
                      {resp.imageUrl ? (
                        <a
                          href={resp.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-md border border-border"
                        >
                          <img
                            src={resp.imageUrl}
                            alt="Student upload"
                            className="max-h-48 w-full bg-muted/30 object-contain"
                          />
                        </a>
                      ) : null}
                      {resp.teacherMark?.feedback ? (
                        <p className="rounded-md bg-muted px-2.5 py-1.5 text-xs">
                          <span className="font-medium">Feedback: </span>
                          {resp.teacherMark.feedback}
                        </p>
                      ) : null}
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => openMarkDialog(resp)}
                        >
                          {resp.teacherMark ? "Update mark" : "Mark response"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(markingResponse)}
        onOpenChange={(nextOpen) => !nextOpen && setMarkingResponse(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark student response</DialogTitle>
            <DialogDescription>
              Award marks out of {question.maxMarks} and share optional
              feedback.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="mark-awarded-input">
                Marks awarded (max {question.maxMarks})
              </Label>
              <Input
                id="mark-awarded-input"
                type="number"
                min={0}
                max={question.maxMarks}
                value={marksAwarded}
                onChange={(event) => setMarksAwarded(event.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mark-feedback-input">Feedback (optional)</Label>
              <Textarea
                id="mark-feedback-input"
                rows={3}
                placeholder="Explain strengths or next steps..."
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={markResponse.isPending}
              onClick={() => setMarkingResponse(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                markResponse.isPending ||
                marksAwarded.trim() === "" ||
                Number.isNaN(Number(marksAwarded)) ||
                Number(marksAwarded) < 0 ||
                Number(marksAwarded) > question.maxMarks
              }
              onClick={() => {
                if (!markingResponse) return;
                markResponse.mutate(
                  {
                    boardQuestionId: question.id,
                    responseId: markingResponse.id,
                    marksAwarded: Number(marksAwarded),
                    maxMarks: question.maxMarks,
                    feedback: feedback.trim() || undefined,
                  },
                  { onSuccess: () => setMarkingResponse(null) },
                );
              }}
            >
              {markResponse.isPending ? "Saving..." : "Save mark"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
