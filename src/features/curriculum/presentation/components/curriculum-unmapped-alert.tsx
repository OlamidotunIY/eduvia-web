import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import type { UnmappedSubjectSummary } from "@/shared/domain";

interface CurriculumUnmappedAlertProps {
  unmappedSubjects: UnmappedSubjectSummary[];
}

export function CurriculumUnmappedAlert({
  unmappedSubjects,
}: CurriculumUnmappedAlertProps) {
  if (unmappedSubjects.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">
            {unmappedSubjects.length}{" "}
            {unmappedSubjects.length === 1 ? "subject is" : "subjects are"} not
            mapped to standard platform curricula
          </p>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
            Unmapped subjects (
            <span className="font-medium">
              {unmappedSubjects.map((s) => s.name).join(", ")}
            </span>
            ) will not display learning objectives until linked to a platform
            subject in your settings.
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        render={<Link to={APP_ROUTES.SUBJECTS} />}
        className="shrink-0 border-amber-500/40 bg-background text-foreground hover:bg-amber-500/20"
      >
        Manage Subjects
        <ArrowRight className="size-3.5" />
      </Button>
    </div>
  );
}
