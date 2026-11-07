import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import type {
  CurriculumProfileSummary,
  OfferedSubjectSummary,
  UnmappedSubjectSummary,
} from "@/shared/domain";

interface CurriculumMatrixViewProps {
  offeredSubjects: OfferedSubjectSummary[];
  unmappedSubjects: UnmappedSubjectSummary[];
  activeCurriculum?: CurriculumProfileSummary;
  onExploreSubject: (subjectName: string) => void;
}

export function CurriculumMatrixView({
  offeredSubjects,
  unmappedSubjects,
  activeCurriculum,
  onExploreSubject,
}: CurriculumMatrixViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">
          Subject Alignment Matrix
        </h3>
        <p className="text-xs text-muted-foreground">
          Overview of organization subjects and their mapping to standard national and international curricula.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Offered Subjects</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {offeredSubjects.length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Registered in your organization catalog
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Mapped to Standards</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {offeredSubjects.filter((s) => s.isMapped).length}
            </p>
            <p className="mt-0.5 text-xs text-emerald-600/80 dark:text-emerald-400/80">
              Active with curriculum learning objectives
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Unmapped Subjects</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {unmappedSubjects.length}
            </p>
            <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-400/80">
              Custom subjects awaiting platform link
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Subject Alignment Status
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              render={<Link to={APP_ROUTES.SUBJECTS} />}
              className="h-7 gap-1.5 text-xs"
            >
              <Settings className="size-3.5" />
              Manage Subjects
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Offered Subject</TableHead>
                <TableHead className="text-xs">Mapping Status</TableHead>
                <TableHead className="text-xs">Active Framework</TableHead>
                <TableHead className="text-right text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offeredSubjects.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-muted/40">
                  <TableCell className="text-xs font-semibold text-foreground">
                    {sub.name}
                  </TableCell>
                  <TableCell>
                    {sub.isMapped ? (
                      <Badge
                        variant="secondary"
                        className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-normal text-[11px]"
                      >
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        Mapped to Standard
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-normal text-[11px]"
                      >
                        <AlertCircle className="size-3 text-amber-500" />
                        Unmapped Custom
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {sub.isMapped && activeCurriculum ? (
                      <span className="font-medium text-foreground">
                        {activeCurriculum.name} ({activeCurriculum.shortCode})
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {sub.isMapped ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExploreSubject(sub.name)}
                        className="h-7 text-xs text-primary hover:text-primary gap-1"
                      >
                        <span>View Tree</span>
                        <ArrowRight className="size-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        render={<Link to={APP_ROUTES.SUBJECTS} />}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Map in Settings
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
