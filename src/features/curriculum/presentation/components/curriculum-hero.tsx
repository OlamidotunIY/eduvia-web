import {
  Award,
  BookCheck,
  FolderTree,
  Grid3X3,
  ListFilter,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { cn } from "cn";
import type { CurriculumProfileSummary } from "@/shared/domain";

export type CurriculumViewMode = "explorer" | "matrix" | "directory";

interface CurriculumHeroProps {
  currentCurriculum?: CurriculumProfileSummary;
  curricula: CurriculumProfileSummary[];
  selectedCurriculumId: string;
  onSelectCurriculum: (id: string) => void;
  coveredCountries: string[];
  enrolledStudentCount: number;
  totalOfferedSubjects: number;
  totalTreeNodes: number;
  viewMode: CurriculumViewMode;
  onViewModeChange: (mode: CurriculumViewMode) => void;
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

export function CurriculumHero({
  currentCurriculum,
  curricula,
  selectedCurriculumId,
  onSelectCurriculum,
  coveredCountries,
  enrolledStudentCount,
  totalOfferedSubjects,
  totalTreeNodes,
  viewMode,
  onViewModeChange,
  onOpenSearch,
}: CurriculumHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card via-card/80 to-card/40 p-6 shadow-xs backdrop-blur-xs">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: Main Title, Badge & Meta */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1.5 border border-primary/20 bg-primary/10 text-primary py-1 px-2.5 text-xs font-medium"
            >
              <Sparkles className="size-3.5" />
              <span>Academic Standards & Frameworks</span>
            </Badge>

            {coveredCountries.map((code) => {
              const meta = countryNames[code] ?? { name: code, flag: "🌐" };
              return (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  <span>{meta.flag}</span>
                  <span>{meta.name}</span>
                </span>
              );
            })}
          </div>

          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Curriculum & Learning Objectives
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Explore national and international educational standards pruned directly to your organization's offered subjects and enrolled learner demographics.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          {currentCurriculum && (
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Award className="size-4 text-primary" />
                <span>{currentCurriculum.name}</span>
                <span className="font-mono text-[11px] text-primary">
                  ({currentCurriculum.shortCode})
                </span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5">
                <BookCheck className="size-4 text-emerald-500" />
                <span>
                  <strong className="text-foreground">
                    {currentCurriculum.mappedOfferedSubjectCount}
                  </strong>{" "}
                  of {totalOfferedSubjects} offered subjects mapped
                </span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5">
                <FolderTree className="size-4 text-purple-500" />
                <span>
                  <strong className="text-foreground">{totalTreeNodes}</strong>{" "}
                  curriculum nodes
                </span>
              </div>
              {enrolledStudentCount > 0 && (
                <>
                  <span className="text-border">•</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="size-4 text-amber-500" />
                    <span>
                      <strong className="text-foreground">
                        {enrolledStudentCount}
                      </strong>{" "}
                      enrolled {enrolledStudentCount === 1 ? "learner" : "learners"}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Switcher & Quick Search Trigger */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          {curricula.length > 0 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="hero-curriculum-select"
                className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                Framework:
              </label>
              <select
                id="hero-curriculum-select"
                value={selectedCurriculumId}
                onChange={(e) => onSelectCurriculum(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background/80 px-3 py-1 text-xs font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {curricula.map((c) => (
                  <option key={c.id} value={c.id}>
                    {countryNames[c.countryCode]?.flag ?? "🌐"} {c.shortCode} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSearch}
            className="h-9 gap-2 bg-background/60 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Search className="size-3.5" />
            <span>Search all standards...</span>
            <kbd className="pointer-events-none hidden h-4.5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-80 sm:inline-flex">
              /
            </kbd>
          </Button>
        </div>
      </div>

      {/* Bottom View Mode Tab Switcher */}
      <div className="mt-6 flex border-t border-border/50 pt-4">
        <div className="inline-flex rounded-lg border border-border/60 bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => onViewModeChange("explorer")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition",
              viewMode === "explorer"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FolderTree className="size-3.5 text-primary" />
            <span>Curriculum Explorer</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("matrix")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition",
              viewMode === "matrix"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Grid3X3 className="size-3.5 text-emerald-500" />
            <span>Subject Alignment Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("directory")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition",
              viewMode === "directory"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ListFilter className="size-3.5 text-amber-500" />
            <span>All Objectives Directory</span>
          </button>
        </div>
      </div>
    </div>
  );
}
