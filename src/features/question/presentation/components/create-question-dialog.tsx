import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/shared/ui/textarea";
import type { CreateQuestionInput, QuestionType } from "@/shared/domain";

interface CreateQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Array<{ id: string; name: string }>;
  isSubmitting?: boolean;
  onSubmit: (input: CreateQuestionInput) => void;
}

export function CreateQuestionDialog({
  open,
  onOpenChange,
  subjects,
  isSubmitting,
  onSubmit,
}: CreateQuestionDialogProps) {
  const [stem, setStem] = useState("");
  const [subject, setSubject] = useState(subjects[0]?.name ?? "Mathematics");
  const [type, setType] = useState<QuestionType>("mcq");
  const [difficultyLevel, setDifficultyLevel] = useState("2");
  const [maxMarks, setMaxMarks] = useState("1");
  const [markScheme, setMarkScheme] = useState("");
  const [options, setOptions] = useState<Array<{ key: string; text: string }>>([
    { key: "A", text: "" },
    { key: "B", text: "" },
    { key: "C", text: "" },
    { key: "D", text: "" },
  ]);
  const [correctOptionKey, setCorrectOptionKey] = useState("A");
  const [isPublished, setIsPublished] = useState(true);

  const resetForm = () => {
    setStem("");
    setType("mcq");
    setDifficultyLevel("2");
    setMaxMarks("1");
    setMarkScheme("");
    setOptions([
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" },
    ]);
    setCorrectOptionKey("A");
    setIsPublished(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stem.trim()) return;

    const payload: CreateQuestionInput = {
      stem: stem.trim(),
      subject,
      type,
      difficultyLevel: Number(difficultyLevel) || 2,
      maxMarks: Number(maxMarks) || 1,
      isPublished,
    };

    if (type === "mcq") {
      payload.options = options.map((opt) => ({
        key: opt.key,
        text: opt.text.trim(),
      }));
      payload.correctOptionKey = correctOptionKey;
    } else {
      payload.markScheme = markScheme.trim();
    }

    onSubmit(payload);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl font-bold">
            Create new question
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add a new question to your organization&apos;s question bank.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="grid gap-2">
            <Label className="text-xs font-medium">Question prompt / stem</Label>
            <Textarea
              required
              rows={3}
              placeholder="e.g. Solve 3x + 7 = 22"
              value={stem}
              onChange={(e) => setStem(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="text-xs font-medium">Subject</Label>
              <Select value={subject} onValueChange={(val) => setSubject(val ?? "Mathematics")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue>{subject}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subjects.length ? (
                    subjects.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-medium">Question type</Label>
              <Select value={type} onValueChange={(val) => setType(val as QuestionType)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple choice</SelectItem>
                  <SelectItem value="short_answer">Short answer</SelectItem>
                  <SelectItem value="long_answer">Long answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label className="text-xs font-medium">Difficulty level</Label>
              <Select value={difficultyLevel} onValueChange={(val) => setDifficultyLevel(val ?? "2")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 / 5 (Very easy)</SelectItem>
                  <SelectItem value="2">2 / 5 (Easy)</SelectItem>
                  <SelectItem value="3">3 / 5 (Medium)</SelectItem>
                  <SelectItem value="4">4 / 5 (Hard)</SelectItem>
                  <SelectItem value="5">5 / 5 (Very hard)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-medium">Max marks</Label>
              <Input
                type="number"
                min="1"
                className="h-9 text-xs"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-medium">Initial status</Label>
              <Select
                value={isPublished ? "published" : "draft"}
                onValueChange={(val) => setIsPublished(val === "published")}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "mcq" ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-background/50 p-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Multiple choice options</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-7 text-xs text-primary"
                  onClick={() => {
                    const nextKey = String.fromCharCode(65 + options.length);
                    setOptions([...options, { key: nextKey, text: "" }]);
                  }}
                >
                  <Plus className="mr-1 size-3" /> Add option
                </Button>
              </div>

              {options.map((opt, index) => (
                <div key={opt.key} className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/80 text-xs font-bold text-foreground">
                    {opt.key}
                  </span>
                  <Input
                    required
                    placeholder={`Option ${opt.key} text`}
                    className="h-8 text-xs"
                    value={opt.text}
                    onChange={(e) => {
                      const next = [...options];
                      next[index].text = e.target.value;
                      setOptions(next);
                    }}
                  />
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOptionKey === opt.key}
                    onChange={() => setCorrectOptionKey(opt.key)}
                    className="accent-primary size-4"
                    title={`Mark option ${opt.key} as correct`}
                  />
                  {options.length > 2 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setOptions(options.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground">
                Selected correct answer: <strong className="text-primary">{correctOptionKey}</strong>
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label className="text-xs font-medium">Mark scheme / Model answer</Label>
              <Textarea
                rows={3}
                placeholder="Describe key points required to award marks..."
                value={markScheme}
                onChange={(e) => setMarkScheme(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
