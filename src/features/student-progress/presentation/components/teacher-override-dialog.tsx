import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useApplyMasteryOverrideMutation } from "../../application";
import type { StudentMasteryNode } from "@/shared/domain";

interface TeacherOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: StudentMasteryNode | null;
  studentId: string;
  orgId: string;
}

export function TeacherOverrideDialog({
  open,
  onOpenChange,
  node,
  studentId,
  orgId,
}: TeacherOverrideDialogProps) {
  const [scoreValue, setScoreValue] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const overrideMutation = useApplyMasteryOverrideMutation(studentId, orgId);

  useEffect(() => {
    if (node) {
      setScoreValue(node.score.toString());
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [node, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!node) return;

    const parsed = Number(scoreValue);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setErrorMessage("Please enter a valid mastery score between 0 and 100.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await overrideMutation.mutateAsync({
        nodeId: node.nodeId,
        score: parsed,
      });
      setSuccessMessage("Mastery score successfully updated!");
      setTimeout(() => {
        onOpenChange(false);
      }, 800);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to apply mastery score override.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <DialogTitle>Override Mastery Score</DialogTitle>
          </div>
          <DialogDescription>
            Manually update the learner's mastery score for this curriculum topic.
            Manual adjustments take precedence over previous automated ratings.
          </DialogDescription>
        </DialogHeader>

        {node && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">
              {node.topicName || node.nodeId}
            </p>
            {node.curriculumCode && (
              <p className="text-[11px] text-muted-foreground font-mono">
                Code: {node.curriculumCode}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <span>Current Score:</span>
              <span className="font-semibold text-foreground">{node.score}%</span>
              <span>· Status:</span>
              <span className="font-medium capitalize text-foreground">
                {node.status.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mastery-score" className="text-xs font-medium">
              New Mastery Score (%)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="mastery-score"
                type="number"
                min={0}
                max={100}
                step={1}
                value={scoreValue}
                onChange={(e) => setScoreValue(e.target.value)}
                placeholder="e.g. 85"
                className="w-full text-sm"
                required
              />
              <span className="text-sm font-semibold text-muted-foreground">%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enter a percentage value between 0 and 100.
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertCircle className="size-3.5" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="py-2 text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-3.5" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={overrideMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={overrideMutation.isPending}
              className="gap-1.5"
            >
              {overrideMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Override"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
