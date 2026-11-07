import { BookOpen, Globe, Search } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { CurriculumProfileSummary } from "@/shared/domain";

interface CurriculumHeaderProps {
  coveredCountries: string[];
  enrolledStudentCount: number;
  curricula: CurriculumProfileSummary[];
  selectedCurriculumId?: string;
  onSelectCurriculum: (curriculumId: string) => void;
  onOpenSearch: () => void;
}

const countryNames: Record<string, { name: string; flag: string }> = {
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  UK: { name: "United Kingdom", flag: "🇬🇧" },
  NG: { name: "Nigeria", flag: "🇳🇬" },
  CA: { name: "Canada", flag: "🇨🇦" },
  US: { name: "United States", flag: "🇺🇸" },
  INT: { name: "International", flag: "🌐" },
};

export function CurriculumHeader({
  coveredCountries,
  enrolledStudentCount,
  curricula,
  selectedCurriculumId,
  onSelectCurriculum,
  onOpenSearch,
}: CurriculumHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/60 pb-6 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Curriculum & Standards
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Academic frameworks and learning objectives scoped to your
          organization's offered subjects and student regions.
        </p>

        {coveredCountries.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="flex items-center gap-1 font-medium text-muted-foreground">
              <Globe className="size-3.5" /> Covered regions:
            </span>
            {coveredCountries.map((code) => {
              const meta = countryNames[code] ?? { name: code, flag: "🌐" };
              return (
                <Badge
                  key={code}
                  variant="secondary"
                  className="gap-1 border border-border/50 font-normal"
                >
                  <span>{meta.flag}</span>
                  <span>{meta.name}</span>
                </Badge>
              );
            })}
            {enrolledStudentCount > 0 && (
              <span className="text-muted-foreground">
                ({enrolledStudentCount} enrolled{" "}
                {enrolledStudentCount === 1 ? "learner" : "learners"})
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {curricula.length > 0 && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="curriculum-select"
              className="text-xs font-medium text-muted-foreground whitespace-nowrap"
            >
              Framework:
            </label>
            <select
              id="curriculum-select"
              value={selectedCurriculumId}
              onChange={(e) => onSelectCurriculum(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {curricula.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortCode} - {c.name} ({c.mappedOfferedSubjectCount} subjects)
                </option>
              ))}
            </select>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Search className="size-4" />
          <span>Search curriculum...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-flex">
            /
          </kbd>
        </Button>
      </div>
    </div>
  );
}
