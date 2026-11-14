import { useState } from "react";
import { CheckCircle2, EyeOff, ListChecks, Save, Sparkles } from "lucide-react";
import type { LessonPlan } from "@/shared/domain";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

function splitLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function BoardPlanDrawerContent({
  plan,
  canEdit,
  isSaving,
  isCompleting,
  onSavePlan,
  onCompletePlan,
}: {
  plan: LessonPlan;
  canEdit: boolean;
  isSaving: boolean;
  isCompleting: boolean;
  onSavePlan: (input: {
    learningObjectives: string[];
    topicsCovered: string[];
    teachingNotes: string | null;
    homeworkDescription: string | null;
  }) => void;
  onCompletePlan: () => void;
}) {
  const planFingerprint = JSON.stringify([
    plan.learningObjectives,
    plan.topicsCovered,
    plan.teachingNotes,
    plan.homeworkDescription,
  ]);

  const [draft, setDraft] = useState<{
    fingerprint: string;
    objectivesText: string;
    topicsText: string;
    teachingNotes: string;
    homeworkDescription: string;
  } | null>(null);

  const activeDraft =
    draft && draft.fingerprint === planFingerprint
      ? draft
      : {
          fingerprint: planFingerprint,
          objectivesText: plan.learningObjectives.join("\n"),
          topicsText: plan.topicsCovered.join("\n"),
          teachingNotes: plan.teachingNotes ?? "",
          homeworkDescription: plan.homeworkDescription ?? "",
        };

  const updateField = (
    patch: Partial<{
      objectivesText: string;
      topicsText: string;
      teachingNotes: string;
      homeworkDescription: string;
    }>,
  ) => {
    setDraft({ ...activeDraft, ...patch });
  };

  if (!canEdit) {
    const hasContent =
      plan.learningObjectives.length > 0 ||
      plan.topicsCovered.length > 0 ||
      Boolean(plan.homeworkDescription);

    if (!hasContent) {
      return (
        <p className="py-6 text-sm text-muted-foreground">
          No lesson plan items have been shared for this session yet.
        </p>
      );
    }

    return (
      <div className="space-y-6">
        {plan.isCompleted ? (
          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          >
            <CheckCircle2 className="size-3.5" />
            Plan completed
          </Badge>
        ) : null}

        {plan.learningObjectives.length > 0 ? (
          <div className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ListChecks className="size-3.5 text-primary" />
              Learning objectives
            </h3>
            <ul className="space-y-2 text-sm text-foreground">
              {plan.learningObjectives.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {plan.topicsCovered.length > 0 ? (
          <div className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Topics covered
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {plan.topicsCovered.map((topic, idx) => (
                <Badge key={idx} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {plan.homeworkDescription ? (
          <div className="border-l-2 border-primary/50 pl-3.5">
            <h3 className="text-xs font-medium text-primary">Homework</h3>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">
              {plan.homeworkDescription}
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {plan.isCompleted ? (
          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          >
            <CheckCircle2 className="size-3.5" />
            Plan completed
          </Badge>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isCompleting || isSaving}
            onClick={onCompletePlan}
          >
            <CheckCircle2 className="size-4" />
            {isCompleting ? "Completing..." : "Mark plan complete"}
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={() =>
            onSavePlan({
              learningObjectives: splitLines(activeDraft.objectivesText),
              topicsCovered: splitLines(activeDraft.topicsText),
              teachingNotes: activeDraft.teachingNotes.trim() || null,
              homeworkDescription:
                activeDraft.homeworkDescription.trim() || null,
            })
          }
        >
          <Save className="size-4" />
          {isSaving ? "Saving..." : "Save plan"}
        </Button>
      </div>

      <Alert>
        <EyeOff className="size-4" />
        <AlertDescription className="text-xs">
          Private teaching notes are only visible to teachers. Objectives,
          topics, and homework are shared with learners.
        </AlertDescription>
      </Alert>

      <div className="space-y-1.5">
        <Label htmlFor="board-plan-objectives">
          Learning objectives (one per line)
        </Label>
        <Textarea
          id="board-plan-objectives"
          rows={4}
          placeholder="e.g. Solve quadratic equations by completing the square"
          value={activeDraft.objectivesText}
          onChange={(event) =>
            updateField({ objectivesText: event.target.value })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="board-plan-topics">Topics covered (one per line)</Label>
        <Textarea
          id="board-plan-topics"
          rows={3}
          placeholder="e.g. Quadratics&#10;Factorisation"
          value={activeDraft.topicsText}
          onChange={(event) => updateField({ topicsText: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="board-teaching-notes">Private teaching notes</Label>
          <Badge variant="outline" className="text-[10px]">
            Teacher only
          </Badge>
        </div>
        <Textarea
          id="board-teaching-notes"
          rows={3}
          placeholder="Private pacing cues or differentiation reminders..."
          value={activeDraft.teachingNotes}
          onChange={(event) =>
            updateField({ teachingNotes: event.target.value })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="board-homework-description">Homework</Label>
        <Textarea
          id="board-homework-description"
          rows={3}
          placeholder="Follow-up reading or practice exercises..."
          value={activeDraft.homeworkDescription}
          onChange={(event) =>
            updateField({ homeworkDescription: event.target.value })
          }
        />
      </div>
    </div>
  );
}
