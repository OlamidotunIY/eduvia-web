import {
  Award,
  BookCheck,
  CheckCircle2,
  FolderTree,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import type { CurriculumProfileSummary } from "@/shared/domain";

interface CurriculumStatsProps {
  currentCurriculum?: CurriculumProfileSummary;
  totalTreeNodes: number;
  totalOfferedSubjects: number;
  enrolledStudentCount: number;
}

export function CurriculumStats({
  currentCurriculum,
  totalTreeNodes,
  totalOfferedSubjects,
  enrolledStudentCount,
}: CurriculumStatsProps) {
  if (!currentCurriculum) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Award className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-primary">
                {currentCurriculum.shortCode}
              </span>
              <Badge variant="outline" className="text-[10px] py-0 h-4">
                {currentCurriculum.countryCode}
              </Badge>
            </div>
            <p className="truncate text-sm font-medium text-foreground">
              {currentCurriculum.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentCurriculum.authority}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <BookCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Mapped Subjects
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">
                {currentCurriculum.mappedOfferedSubjectCount}
              </span>
              <span className="text-xs text-muted-foreground">
                of {totalOfferedSubjects} offered
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Filtered to active subjects
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <FolderTree className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Curriculum Nodes
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">
                {totalTreeNodes}
              </span>
              <span className="text-xs text-muted-foreground">
                nodes visible
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Key stages, strands & topics
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Regional Scope
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">
                {enrolledStudentCount}
              </span>
              <span className="text-xs text-muted-foreground">
                enrolled {enrolledStudentCount === 1 ? "student" : "students"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Scoped by classroom enrollments
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
