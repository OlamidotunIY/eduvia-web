import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { APP_ROUTES } from "@/shared/constant/routes.constants";

interface CurriculumPreviewCalloutProps {
  frameworkName: string;
  hasOfferedSubjects: boolean;
}

export function CurriculumPreviewCallout({
  frameworkName,
  hasOfferedSubjects,
}: CurriculumPreviewCalloutProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 text-foreground shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Sparkles className="size-4.5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Reference Curriculum View
              </span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                Preview Mode
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">
              Displaying the full standard curriculum for{" "}
              <span className="font-semibold text-primary">{frameworkName}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {hasOfferedSubjects
                ? "Your organization's subjects are not yet linked to platform standards. Map them in Subject Settings to automatically prune this view to only what you teach."
                : "To tailor this curriculum to your school's actual schedule and classrooms, add your offered subjects in Subject Settings."}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          render={<Link to={APP_ROUTES.SUBJECTS} />}
          className="shrink-0 gap-1.5 self-start sm:self-center"
        >
          <span>Configure Subjects</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
